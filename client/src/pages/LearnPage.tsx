/* Feature module: teacher learning with local-first progress and cloud sync. */
import { Check, Headphones, Play, Target } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { phrases } from "@/data/catalog";
import { useAppStore } from "@/contexts/AppStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "@/lib/router";

export default function LearnPage() {
  const { completedLessonIds, savedPhrases, downloadedBookIds, toggleLesson } = useAppStore();
  const auth = useAuth();
  const progressSave = trpc.progress.save.useMutation();
  const percent = Math.round((completedLessonIds.length / phrases.length) * 100);

  function toggleAndSync(id: number) {
    const nextIds = completedLessonIds.includes(id) ? completedLessonIds.filter((item) => item !== id) : [...completedLessonIds, id];
    toggleLesson(id);
    if (auth.isAuthenticated) progressSave.mutate({ completedPhrases: nextIds, savedPhrases, downloadedBooks: downloadedBookIds });
    toast.success(auth.isAuthenticated ? "Progress saved to your profile" : "Progress saved locally");
  }

  return <AppShell><main className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20"><div><div className="section-eyebrow">Feature / 02 · Teacher learning</div><h1 className="font-display text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">Small steps.<br /><span className="text-[#f1b36d]">Strong roots.</span></h1><p className="mt-7 max-w-[450px] text-[16px] leading-7 text-[#566055]">Five phrases make one useful classroom moment. Progress is saved instantly on this device and synced to your profile when signed in.</p><div className="mt-10 flex items-center gap-5"><div className="relative grid size-28 place-items-center rounded-full border border-[#2d6b4a]/20" style={{ background: `conic-gradient(#e45d32 ${percent * 3.6}deg, #e8ded0 0)` }}><div className="grid size-[92px] place-items-center rounded-full bg-[#f8f2e8] font-display text-3xl text-[#2d6b4a]">{percent}%</div></div><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">Today’s progress</div><div className="mt-1 font-display text-2xl">{completedLessonIds.length} of {phrases.length} complete</div></div></div><Link to="/translate" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#e45d32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#c94e2a]">Practice a phrase <span>→</span></Link></div><div className="ruled-surface rounded-[28px] border border-[#20251f]/10 bg-[#2d6b4a] p-6 text-[#f8f2e8] shadow-[0_18px_45px_rgba(32,37,31,0.12)] sm:p-9"><div className="flex items-start justify-between gap-5"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8f2e8]/55">Lesson 04 / 18</div><h2 className="mt-2 font-display text-4xl">Introductions</h2></div><div className="field-stamp field-stamp--light">PS</div></div><div className="mt-8 space-y-1">{phrases.map((phrase) => { const complete = completedLessonIds.includes(phrase.id); return <div key={phrase.id} className="flex items-center gap-4 border-b border-[#f8f2e8]/10 py-4"><button onClick={() => toggleAndSync(phrase.id)} className={`grid size-9 shrink-0 place-items-center rounded-full border ${complete ? "border-[#f1b36d] bg-[#f1b36d] text-[#20251f]" : "border-[#f8f2e8]/30 text-transparent hover:border-[#f1b36d]"}`} aria-label="Toggle phrase complete"><Check size={16} /></button><div className="min-w-0 flex-1"><div className={`font-semibold ${complete ? "text-[#f8f2e8]/45 line-through" : ""}`}>{phrase.hindi}</div><div className="mt-1 font-mono text-[10px] text-[#f8f2e8]/45">{phrase.santhali}</div></div><button onClick={() => { if (window.speechSynthesis) { const speech = new SpeechSynthesisUtterance(phrase.santhali); speech.lang = "hi-IN"; window.speechSynthesis.speak(speech); } else toast("Pronunciation preview", { description: phrase.sound }); }} className="grid size-8 place-items-center rounded-full border border-[#f8f2e8]/15 text-[#f1b36d] hover:bg-[#f1b36d] hover:text-[#20251f]" aria-label="Play pronunciation"><Headphones size={14} /></button></div>; })}</div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f8f2e8]/10 p-4"><Target size={17} className="text-[#f1b36d]" /><div className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#f8f2e8]/55">Weekly target</div><div className="mt-1 text-lg font-semibold">50 phrases</div></div><div className="rounded-2xl bg-[#f8f2e8]/10 p-4"><Play size={17} className="text-[#f1b36d]" /><div className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[#f8f2e8]/55">Sync state</div><div className="mt-1 text-lg font-semibold">{auth.isAuthenticated ? "Cloud ready" : "Local only"}</div></div></div></div></div></main></AppShell>;
}
