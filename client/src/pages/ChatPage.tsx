/*
 * AI Chat — UI prototype. Messages are handled with local mock responses
 * so the interaction model (composing, streaming feel, model switch) is real
 * to use, without pretending a live model backend exists here.
 */
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
import AppShell from "@/components/AppShell";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; text: string };

const MODELS = ["Field Assistant · Fast", "Field Assistant · Detailed", "Field Assistant · Multilingual"];

const MOCK_REPLIES = [
  "Here's a draft outline for that lesson — I can adjust reading level or add local examples if useful.",
  "I've broken this into three steps. Want me to expand any one of them?",
  "That translates naturally into Hindi with a slightly more formal register — want the casual version too?",
  "Here's a summary of the key points, ordered by importance.",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "assistant", text: "Hi — I'm your field assistant. Ask me to draft a lesson, translate a passage, or summarize notes." },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  function send() {
    if (!input.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    window.setTimeout(() => {
      const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
      setIsTyping(false);
    }, 900);
  }

  return (
    <AppShell>
      <main className="mx-auto flex h-[calc(100vh-88px)] max-w-[900px] flex-col px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="sohrai-rule mb-3" aria-hidden="true" />
            <h1 className="font-display text-[26px]">Chat with your field assistant</h1>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            aria-label="Model selection"
            className="field-input w-auto py-2 text-[12px]"
          >
            {MODELS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div ref={scrollRef} className="mt-5 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[#20251f]/10 bg-[#fffdf8] p-5 dark:border-white/10 dark:bg-[#232922]">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-[#20251f] text-white" : "bg-[#e45d32] text-white"}`}>
                {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${m.role === "user" ? "bg-[#20251f] text-[#f8f2e8]" : "bg-[#f1e9db] text-[#20251f] dark:bg-[#2b3129] dark:text-[#f8f2e8]"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 pl-11 font-mono text-[11px] text-[#6b746a]">
              <Sparkles size={12} className="animate-pulse" /> thinking…
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="mt-4 flex items-end gap-2 rounded-2xl border border-[#20251f]/12 bg-[#fffdf8] p-2 dark:border-white/12 dark:bg-[#2b3129]"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="Ask for a lesson plan, translation, or summary…"
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-[14px] outline-none"
          />
          <button type="submit" aria-label="Send message" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e45d32] text-white transition hover:bg-[#c94e28]">
            <Send size={16} />
          </button>
        </form>
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]">Prototype — replies are illustrative, not live model output.</p>
      </main>
    </AppShell>
  );
}
