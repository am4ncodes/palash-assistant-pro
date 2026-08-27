import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { documents, InsertUser, learningProgress, translationCache, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = values.lastSignedIn;
  }
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(learningProgress).where(eq(learningProgress.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function saveProgress(userId: number, input: { completedPhrases: number[]; savedPhrases: number; downloadedBooks: number[] }) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getProgress(userId);
  const values = {
    userId,
    completedPhrases: JSON.stringify(input.completedPhrases),
    savedPhrases: input.savedPhrases,
    downloadedBooks: JSON.stringify(input.downloadedBooks),
  };
  if (existing) {
    await db.update(learningProgress).set(values).where(eq(learningProgress.id, existing.id));
    return { ...existing, ...values };
  }
  const result = await db.insert(learningProgress).values(values);
  return { id: Number(result[0].insertId), ...values };
}

export async function cacheTranslation(userId: number, input: { sourceLanguage: string; targetLanguage: string; sourceText: string; translatedText: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(translationCache).values({ userId, ...input });
}

export async function listDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
}

export async function createDocument(input: typeof documents.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(documents).values(input);
  return { id: Number(result[0].insertId), ...input };
}
