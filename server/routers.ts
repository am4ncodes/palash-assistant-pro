import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createDocument, cacheTranslation, getDb, getProgress, listDocuments, saveProgress } from "./db";
import { documents, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";
import { PDFParse } from "pdf-parse";

const translationInput = z.object({
  sourceLanguage: z.string().min(2).max(32),
  targetLanguage: z.string().min(2).max(32),
  text: z.string().min(1).max(2000),
});

function responseText(response: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = response.choices[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part) => "text" in part ? part.text : "").join(" ").trim();
  return "No translation returned";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    me: protectedProcedure.query(({ ctx }) => ctx.user),
    update: protectedProcedure.input(z.object({ name: z.string().trim().min(1).max(120) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (db) await db.update(users).set({ name: input.name }).where(eq(users.id, ctx.user.id));
      return { ...ctx.user, name: input.name };
    }),
  }),
  progress: router({
    get: protectedProcedure.query(({ ctx }) => getProgress(ctx.user.id)),
    save: protectedProcedure.input(z.object({ completedPhrases: z.array(z.number().int()), savedPhrases: z.number().int().min(0), downloadedBooks: z.array(z.number().int()) })).mutation(({ ctx, input }) => saveProgress(ctx.user.id, input)),
  }),
  ai: router({
    translate: protectedProcedure.input(translationInput).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "You are a careful Hindi and Santhali classroom translator. Return only the translation, preserve meaning, and do not add commentary." },
          { role: "user", content: `Translate from ${input.sourceLanguage} to ${input.targetLanguage}:\n${input.text}` },
        ],
      });
      const translatedText = responseText(response);
      await cacheTranslation(ctx.user.id, { sourceLanguage: input.sourceLanguage, targetLanguage: input.targetLanguage, sourceText: input.text, translatedText });
      return { translatedText, source: "ai", cached: true };
    }),
    speak: protectedProcedure.input(z.object({ text: z.string().min(1).max(2000), language: z.string().min(2).max(32) })).mutation(async ({ input }) => {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "You prepare short classroom text for speech synthesis. Return the exact text only, without quotes, markdown, or commentary." },
          { role: "user", content: `Prepare this ${input.language} phrase for speech: ${input.text}` },
        ],
      });
      return { speechText: responseText(response), language: input.language, source: "secure-server-tts" as const };
    }),
  }),
  documents: router({
    list: protectedProcedure.query(({ ctx }) => listDocuments(ctx.user.id)),
    upload: protectedProcedure.input(z.object({ filename: z.string().min(1).max(255), mimeType: z.literal("application/pdf"), dataBase64: z.string().min(32).max(70_000_000) })).mutation(async ({ ctx, input }) => {
      const base64 = input.dataBase64.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      if (buffer.length > 50 * 1024 * 1024) throw new Error("PDF must be 50MB or smaller");
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const stored = await storagePut(`${ctx.user.id}-documents/${Date.now()}-${safeName}`, buffer, "application/pdf");
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      return createDocument({ userId: ctx.user.id, filename: input.filename, mimeType: input.mimeType, fileKey: stored.key, fileUrl: stored.url, extractedText: parsed.text.slice(0, 100_000), pageCount: parsed.total });
    }),
  }),
});

export type AppRouter = typeof appRouter;
