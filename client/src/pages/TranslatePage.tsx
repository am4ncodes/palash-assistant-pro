/* Feature module: secure AI translation, cloud audio, and progressive TTS fallback. */
import { useEffect, useState } from "react";
import { ArrowLeftRight, BookMarked, Copy, Headphones, Send, Share2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { phrases } from "@/data/catalog";
import { useAppStore } from "@/contexts/AppStore";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function TranslatePage() {
  const { savePhrase } = useAppStore();
  const auth = useAuth();
  const translateMutation = trpc.ai.translate.useMutation();
  const speakMutation = trpc.ai.speak.useMutation();
  const audioMutation = trpc.ai.generateAudio.useMutation();
  const audioHistoryQuery = trpc.ai.audioHistory.useQuery(undefined, { enabled: auth.isAuthenticated });
  const [direction, setDirection] = useState<"hi-to-sat" | "sat-to-hi">("hi-to-sat");
  const [input, setInput] = useState(phrases[0].hindi);
  const [result, setResult] = useState(phrases[0].santhali);
  const [audioUrl, setAudioUrl] = useState("");
  const [speed, setSpeed] = useState(0.82);
  const [voiceId, setVoiceId] = useState("EXAVITQu4vr4xnSDxMaL");
  const [history, setHistory] = useState<string[]>([]);
  const online = navigator.onLine;

  useEffect(() => {
    const storedDirection = window.localStorage.getItem("palash-direction");
    if (storedDirection === "sat-to-hi") setDirection("sat-to-hi");
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); void translate(); }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "s") { event.preventDefault(); void speak(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [input, result, direction, auth.isAuthenticated]);

  useEffect(() => { window.localStorage.setItem("palash-direction", direction); }, [direction]);

  async function speak() {
    if (!auth.isAuthenticated) { startLogin(); return; }
    if (!window.speechSynthesis) { toast("Speech is not supported in this browser", { description: "The text result is still available." }); return; }
    try {
      const prepared = await speakMutation.mutateAsync({ text: result, language: direction === "hi-to-sat" ? "Santhali" : "Hindi" });
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(prepared.speechText);
      utterance.lang = "hi-IN";
      utterance.rate = speed;
      window.speechSynthesis.speak(utterance);
    } catch { toast.error("Speech preparation unavailable", { description: "You can still read the translation." }); }
  }

  async function downloadCloudAudio() {
    if (!auth.isAuthenticated) { startLogin(); return; }
    try {
      const audio = await audioMutation.mutateAsync({ text: result, language: direction === "hi-to-sat" ? "Santhali" : "Hindi", voiceId });
      if (audio?.fileUrl) setAudioUrl(audio.fileUrl);
      await audioHistoryQuery.refetch();
      toast.success("High-quality audio ready", { description: "Your MP3 is ready to download." });
    } catch { toast.error("Cloud audio unavailable", { description: "Try again or use browser speech." }); }
  }

  async function translate() {
    if (!auth.isAuthenticated) { startLogin(); return; }
    const localMatch = phrases.find((phrase) => phrase.hindi === input || phrase.santhali === input);
    if (!online && localMatch) {
      setResult(direction === "hi-to-sat" ? localMatch.santhali : localMatch.hindi);
      toast.success("Used the validated offline phrasebook");
      return;
    }
    if (!input.trim()) return;
    try {
      const response = await translateMutation.mutateAsync({ sourceLanguage: direction === "hi-to-sat" ? "Hindi" : "Santhali", targetLanguage: direction === "hi-to-sat" ? "Santhali" : "Hindi", text: input.trim() });
      setResult(response.translatedText);
      setHistory((current) => [input.trim(), ...current].slice(0, 5));
      toast.success("AI translation ready", { description: "Saved to your secure translation cache." });
    } catch { toast.error("Translation unavailable", { description: "Try a validated phrase while offline." }); }
  }

  async function copyResult() {
    await navigator.clipboard?.writeText(result);
    toast.success("Translation copied");
  }

  async function shareResult() {
    if (navigator.share) await navigator.share({ title: "Palash translation", text: `${input}\n${result}` });
    else await copyResult();
  }

  function swap() {
    setDirection((current) => current === "hi-to-sat" ? "sat-to-hi" : "hi-to-sat");
    setInput(result);
    setResult(input);
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <div className="section-eyebrow">Feature / 01 · Translation</div>
            <h1 className="font-display text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">A phrase<br /><span className="text-[#e45d32]">at a time.</span></h1>
            <p className="mt-7 max-w-[500px] text-[16px] leading-7 text-[#566055]">Real AI translation when you’re signed in and connected. Validated phrase matching stays available when the network goes quiet.</p>
          </div>
          <div className="w-full max-w-[300px] rounded-[22px] border border-[#20251f]/10 bg-[#e8f1e5] p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2d6b4a]">{online ? <Wifi size={14} /> : <WifiOff size={14} />} Current mode</div>
            <div className="mt-3 font-display text-3xl">{online ? "AI assist" : "Offline ready"}</div>
            <div className="mt-2 text-sm text-[#566055]">{auth.isAuthenticated ? (online ? "Server-side translation is ready." : "Local phrase matching remains available.") : "Sign in to use secure AI translation."}</div>
            {!auth.isAuthenticated && <button onClick={() => startLogin()} className="mt-4 rounded-full bg-[#20251f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d6b4a]">Sign in to translate</button>}
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">
          <div>
            <div className="ruled-surface overflow-hidden rounded-[28px] border border-[#20251f]/12 bg-white shadow-[0_16px_50px_rgba(32,37,31,0.07)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#20251f]/10 bg-[#fffaf3] px-6 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">{direction === "hi-to-sat" ? "Hindi → Santhali" : "Santhali → Hindi"}</span>
                <button onClick={swap} className="inline-flex items-center gap-2 rounded-full border border-[#20251f]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] hover:border-[#e45d32] hover:text-[#e45d32]"><ArrowLeftRight size={14} /> Swap direction</button>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="border-b border-[#20251f]/10 p-7 md:border-b-0 md:border-r">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9a9f97]">Input phrase</div>
                  <textarea value={input} onChange={(event) => setInput(event.target.value)} className="mt-8 min-h-[180px] w-full resize-none bg-transparent font-display text-4xl leading-tight outline-none placeholder:text-[#c5bbb0]" />
                  <div className="mt-8 flex items-center justify-between"><span className="font-mono text-[10px] text-[#9a9f97]">{translateMutation.isPending ? "AI is translating…" : auth.isAuthenticated ? "Ready for secure AI" : "Sign in to use AI"}</span><button disabled={translateMutation.isPending} onClick={translate} className="inline-flex items-center gap-2 rounded-full bg-[#20251f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d6b4a] disabled:opacity-50">Translate <Send size={14} /></button></div>
                </div>
                <div className="bg-[#f2f6ee] p-7">
                  <div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">AI result</div><div className="flex flex-wrap items-center justify-end gap-2"><button onClick={copyResult} className="grid size-9 place-items-center rounded-full bg-white text-[#2d6b4a] hover:bg-[#e45d32] hover:text-white" aria-label="Copy translation"><Copy size={15} /></button><button onClick={shareResult} className="grid size-9 place-items-center rounded-full bg-white text-[#2d6b4a] hover:bg-[#e45d32] hover:text-white" aria-label="Share translation"><Share2 size={15} /></button><button onClick={speak} className="grid size-9 place-items-center rounded-full bg-white text-[#2d6b4a] hover:bg-[#e45d32] hover:text-white" aria-label="Speak translation"><Headphones size={16} /></button><button onClick={downloadCloudAudio} disabled={audioMutation.isPending} className="rounded-full border border-[#2d6b4a]/20 bg-white px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[#2d6b4a] hover:bg-[#2d6b4a] hover:text-white disabled:opacity-50">{audioMutation.isPending ? "Rendering…" : "Make MP3"}</button></div></div>
                  <div className="mt-8 min-h-[180px] font-display text-4xl leading-tight text-[#2d6b4a]">{result}</div>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap items-center gap-2"><label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6b746a]">Speed <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="ml-1 rounded-full border border-[#20251f]/15 bg-white px-2 py-1"><option value="0.62">Slow</option><option value="0.82">Normal</option><option value="1">Fast</option></select></label><label className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6b746a]">Voice <select value={voiceId} onChange={(event) => setVoiceId(event.target.value)} className="ml-1 max-w-24 rounded-full border border-[#20251f]/15 bg-white px-2 py-1"><option value="EXAVITQu4vr4xnSDxMaL">Rachel</option><option value="21m00Tcm4TlvDq8ikWAM">Rachel alt</option></select></label></div><span className="font-mono text-[10px] leading-4 text-[#6b746a]">{online ? "AI-generated · cached server-side" : "Validated phrase · offline"}</span>{audioUrl && <a href={audioUrl} download className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#e45d32] hover:underline">Download MP3</a>}<button onClick={() => { savePhrase(); toast.success("Saved across your profile"); }} className="inline-flex items-center gap-2 rounded-full border border-[#2d6b4a]/25 px-4 py-2.5 text-sm font-semibold text-[#2d6b4a] hover:bg-white"><BookMarked size={14} /> Save</button></div>
                </div>
              </div>
            </div>
            {history.length > 0 && <div className="mt-6 border-t border-[#20251f]/10 pt-5"><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b746a]">Recent translations</div><div className="mt-3 flex flex-wrap gap-2">{history.map((item, index) => <button key={`${item}-${index}`} onClick={() => setInput(item)} className="rounded-full border border-[#20251f]/12 bg-white px-3 py-2 text-xs text-[#566055] hover:border-[#e45d32]">{item.slice(0, 24)}…</button>)}</div></div>}{audioHistoryQuery.data?.length ? <div className="mt-6 border-t border-[#20251f]/10 pt-5"><div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b746a]">Recent cloud audio</div><div className="mt-3 flex flex-wrap gap-2">{audioHistoryQuery.data.slice(0, 3).map((audio) => <a key={audio.id} href={audio.fileUrl} download className="rounded-full border border-[#20251f]/12 bg-white px-3 py-2 text-xs text-[#566055] hover:border-[#e45d32]">{audio.text.slice(0, 24)}…</a>)}</div></div> : null}
          </div>
          <aside className="rounded-[28px] bg-[#20251f] p-7 text-[#f8f2e8]"><div className="field-stamp field-stamp--dark">PS</div><div className="mt-12 font-display text-4xl leading-none">Start with the phrases teachers use most.</div><div className="mt-7 space-y-2">{phrases.map((phrase) => <button key={phrase.id} onClick={() => { setInput(direction === "hi-to-sat" ? phrase.hindi : phrase.santhali); setResult(direction === "hi-to-sat" ? phrase.santhali : phrase.hindi); }} className="block w-full border-b border-[#f8f2e8]/10 py-3 text-left text-sm text-[#f8f2e8]/70 transition hover:text-[#f1b36d]">{direction === "hi-to-sat" ? phrase.hindi : phrase.santhali}</button>)}</div></aside>
        </div>
      </main>
    </AppShell>
  );
}
