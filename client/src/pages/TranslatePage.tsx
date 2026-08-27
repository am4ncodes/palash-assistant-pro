/*
 * Feature module: translation workspace.
 * It is route-loadable on its own and depends only on shared domain data + AppStore.
 */
import { useState } from "react";
import { ArrowLeftRight, BookMarked, Headphones, Send, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { Link } from "@/lib/router";
import { phrases } from "@/data/catalog";
import { useAppStore } from "@/contexts/AppStore";

export default function TranslatePage() {
  const { savePhrase } = useAppStore();
  const [direction, setDirection] = useState<"hi-to-sat" | "sat-to-hi">("hi-to-sat");
  const [input, setInput] = useState(phrases[0].hindi);
  const [result, setResult] = useState(phrases[0].santhali);
  const online = navigator.onLine;

  function translate() {
    const match = phrases.find((phrase) => phrase.hindi === input || phrase.santhali === input);
    setResult(match ? (direction === "hi-to-sat" ? match.santhali : match.hindi) : online ? "Suggested translation ready for review" : "Choose a saved phrase while offline");
  }

  function swap() {
    setDirection((current) => current === "hi-to-sat" ? "sat-to-hi" : "hi-to-sat");
    setInput(result);
    setResult(input);
  }

  return <AppShell><main className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="flex flex-wrap items-start justify-between gap-8"><div><div className="section-eyebrow">Feature / 01 · Translation</div><h1 className="font-display text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">A phrase<br /><span className="text-[#e45d32]">at a time.</span></h1><p className="mt-7 max-w-[500px] text-[16px] leading-7 text-[#566055]">The translation desk is the app’s most dependable instrument: richer when online, still useful when the network is gone.</p></div><div className="w-full max-w-[280px] rounded-[22px] border border-[#20251f]/10 bg-[#e8f1e5] p-5"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2d6b4a]">{online ? <Wifi size={14} /> : <WifiOff size={14} />} Current mode</div><div className="mt-3 font-display text-3xl">{online ? "Online assist" : "Offline ready"}</div><div className="mt-2 text-sm leading-5 text-[#566055]">{online ? "Full-sentence suggestions and cloud audio are available." : "Validated phrases and cached audio remain available."}</div></div></div><div className="mt-12 grid gap-5 lg:grid-cols-[1.5fr_0.5fr]"><div className="ruled-surface overflow-hidden rounded-[28px] border border-[#20251f]/12 bg-white shadow-[0_16px_50px_rgba(32,37,31,0.07)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#20251f]/10 bg-[#fffaf3] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">{direction === "hi-to-sat" ? "Hindi → Santhali" : "Santhali → Hindi"}</span><button onClick={swap} className="inline-flex items-center gap-2 rounded-full border border-[#20251f]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] hover:border-[#e45d32] hover:text-[#e45d32]"><ArrowLeftRight size={14} /> Swap direction</button></div><div className="grid md:grid-cols-2"><div className="border-b border-[#20251f]/10 p-7 md:border-b-0 md:border-r"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9a9f97]">Input phrase</div><textarea value={input} onChange={(event) => setInput(event.target.value)} className="mt-8 min-h-[180px] w-full resize-none bg-transparent font-display text-4xl leading-tight outline-none placeholder:text-[#c5bbb0]" /><div className="mt-8 flex items-center justify-between"><span className="font-mono text-[10px] text-[#9a9f97]">Enter a phrase</span><button onClick={translate} className="inline-flex items-center gap-2 rounded-full bg-[#20251f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d6b4a]">Translate <Send size={14} /></button></div></div><div className="bg-[#f2f6ee] p-7"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">Result</div><button onClick={() => toast("Audio preview", { description: online ? "Cloud pronunciation stream" : "Cached native-speaker clip" })} className="grid size-9 place-items-center rounded-full bg-white text-[#2d6b4a] hover:bg-[#e45d32] hover:text-white"><Headphones size={16} /></button></div><div className="mt-8 min-h-[180px] font-display text-4xl leading-tight text-[#2d6b4a]">{result}</div><div className="mt-8 flex items-center justify-between gap-4"><span className="font-mono text-[10px] leading-4 text-[#6b746a]">{online ? "Online enhancement" : "Validated offline phrase"}</span><button onClick={() => { savePhrase(); toast.success("Saved across the app"); }} className="inline-flex items-center gap-2 rounded-full border border-[#2d6b4a]/25 px-4 py-2.5 text-sm font-semibold text-[#2d6b4a] hover:bg-white"><BookMarked size={14} /> Save</button></div></div></div></div><aside className="rounded-[28px] bg-[#20251f] p-7 text-[#f8f2e8]"><div className="field-stamp field-stamp--dark">PS</div><div className="mt-12 font-display text-4xl leading-none">Start with the phrases teachers use most.</div><div className="mt-7 space-y-2">{phrases.map((phrase) => <button key={phrase.id} onClick={() => { setInput(direction === "hi-to-sat" ? phrase.hindi : phrase.santhali); setResult(direction === "hi-to-sat" ? phrase.santhali : phrase.hindi); }} className="block w-full border-b border-[#f8f2e8]/10 py-3 text-left text-sm text-[#f8f2e8]/70 transition hover:text-[#f1b36d]">{direction === "hi-to-sat" ? phrase.hindi : phrase.santhali}</button>)}</div><Link to="/learn" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#f1b36d]">Continue to learning <span>→</span></Link></aside></div></main></AppShell>;
}
