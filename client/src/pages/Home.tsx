/*
 * Field Notes direction: rooted clarity, warm utility, visible progress, respectful optimism.
 * This page keeps the central translator close to status, progress, and offline resources.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Cloud,
  Download,
  Headphones,
  Leaf,
  LockKeyhole,
  Menu,
  Mic,
  NotebookPen,
  Play,
  Search,
  Send,
  Sparkles,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const logoUrl = "/manus-storage/palash-mark_612cece7.png";
const heroUrl = "/manus-storage/palash-hero_4872cf4e.jpg";
const teacherUrl = "/manus-storage/palash-teacher_2c1930b6.jpg";
const booksUrl = "/manus-storage/palash-books_4721d8bb.jpg";

type Phrase = {
  hindi: string;
  santhali: string;
  sound: string;
};

const phrases: Phrase[] = [
  { hindi: "आपका नाम क्या है?", santhali: "आम ओल नाम दो?", sound: "aam ol naam do?" },
  { hindi: "आप कैसे हैं?", santhali: "आम नेयना?", sound: "aam neyna?" },
  { hindi: "आज हम सीखेंगे।", santhali: "तिसिंग आड़ा सापिंग।", sound: "tising aada saaping." },
  { hindi: "फिर मिलेंगे।", santhali: "दोसार दाड़ेयाना।", sound: "dosar dadeyana." },
  { hindi: "धन्यवाद।", santhali: "जोहा।", sound: "joha." },
];

const library = [
  { title: "गणित · कक्षा 1", meta: "Bilingual textbook · 14.8 MB", color: "orange", image: booksUrl },
  { title: "हिंदी · कक्षा 2", meta: "Bilingual textbook · 18.2 MB", color: "green", image: booksUrl },
  { title: "पर्यावरण अध्ययन", meta: "Teacher guide · 9.4 MB", color: "indigo", image: booksUrl },
];

function AppMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "gap-2" : ""}`}>
      <div className={`palash-stamp ${compact ? "palash-stamp--compact" : ""}`}>
        <img src={logoUrl} alt="" className="size-8 object-contain" />
      </div>
      <div className="leading-none">
        <div className="font-display text-[18px] text-[#20251f]">Palash</div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#6b746a]">assistant / 01</div>
      </div>
    </div>
  );
}

function SectionEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? "text-[#f8f2e8]/65" : "text-[#6b746a]"}`}>
      <span className={`h-px w-7 ${light ? "bg-[#f8f2e8]/45" : "bg-[#e45d32]"}`} />
      {children}
    </div>
  );
}

export default function Home() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [direction, setDirection] = useState<"hi-to-sat" | "sat-to-hi">("hi-to-sat");
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState(phrases[0].santhali);
  const [translationNote, setTranslationNote] = useState("Validated phrase · cached for offline use");
  const [saved, setSaved] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState<number[]>([0, 1]);
  const [downloaded, setDownloaded] = useState<number[]>([0]);

  const effectiveOnline = online && !simulatedOffline;
  const currentLanguage = direction === "hi-to-sat" ? "Hindi" : "Santhali";
  const targetLanguage = direction === "hi-to-sat" ? "Santhali" : "Hindi";
  const lessonPercent = Math.round((completed.length / phrases.length) * 100);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const translationResult = useMemo(() => translation, [translation]);

  function swapDirection() {
    setDirection((current) => (current === "hi-to-sat" ? "sat-to-hi" : "hi-to-sat"));
    setInput("");
    setTranslation(direction === "hi-to-sat" ? phrases[0].hindi : phrases[0].santhali);
    setTranslationNote("Direction switched · ready for your next phrase");
  }

  function translatePhrase() {
    const cleaned = input.trim().toLowerCase();
    const match = phrases.find((phrase) => {
      const source = direction === "hi-to-sat" ? phrase.hindi : phrase.santhali;
      return source.toLowerCase().includes(cleaned) || cleaned.includes(source.toLowerCase());
    });
    if (match) {
      setTranslation(direction === "hi-to-sat" ? match.santhali : match.hindi);
      setTranslationNote(effectiveOnline ? "Validated phrase · online enhancement" : "Validated phrase · available offline");
    } else if (input.trim()) {
      setTranslation(effectiveOnline ? "Suggested translation ready for review" : "Try one of the saved phrases below");
      setTranslationNote(effectiveOnline ? "AI suggestion · review before teaching" : "Offline phrasebook · 300+ validated phrases");
    } else {
      setTranslation(direction === "hi-to-sat" ? phrases[0].santhali : phrases[0].hindi);
      setTranslationNote("Start with a phrase from today’s lesson");
    }
  }

  function saveTranslation() {
    setSaved((current) => current + 1);
    toast.success("Saved to your offline phrasebook", { description: "This phrase will be ready when the signal disappears." });
  }

  function toggleAudio() {
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1800);
    toast("Playing native-speaker audio", { description: effectiveOnline ? "Cloud audio stream" : "Cached audio clip" });
  }

  function toggleLesson(index: number) {
    setCompleted((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));
  }

  function toggleDownload(index: number) {
    setDownloaded((current) => {
      if (current.includes(index)) return current;
      toast.success("Textbook saved for offline use", { description: library[index].title });
      return [...current, index];
    });
  }

  function comingSoon(label: string) {
    toast(label, { description: "This prototype keeps the offline-first flow local for now." });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f2e8] text-[#20251f] selection:bg-[#e45d32] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%22.6%22/%3E%3C/svg%3E')]" />

      <header className="sticky top-0 z-40 border-b border-[#20251f]/10 bg-[#f8f2e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#top" aria-label="Palash Assistant home"><AppMark /></a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            <a className="nav-link" href="#translate">Translate</a>
            <a className="nav-link" href="#learn">Learn</a>
            <a className="nav-link" href="#library">Library</a>
            <a className="nav-link" href="#community">Community</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSimulatedOffline((current) => !current)}
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] transition hover:-translate-y-0.5 sm:flex ${effectiveOnline ? "border-[#9bc2a3] bg-[#e8f1e5] text-[#2d6b4a]" : "border-[#e3ad91] bg-[#fff0e7] text-[#ad4b2b]"}`}
              aria-label="Toggle prototype connection mode"
            >
              {effectiveOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {effectiveOnline ? "Online assist" : "Offline ready"}
            </button>
            <button onClick={() => setMobileNav((current) => !current)} className="grid size-10 place-items-center rounded-full border border-[#20251f]/15 bg-[#f8f2e8] lg:hidden" aria-label="Toggle navigation">
              {mobileNav ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button onClick={() => comingSoon("Account sync is coming next")} className="hidden h-10 items-center gap-2 rounded-full bg-[#20251f] px-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2d6b4a] sm:flex">
              <span className="grid size-5 place-items-center rounded-full bg-[#e45d32] font-mono text-[9px]">PS</span>
              <span className="text-sm">Teacher mode</span>
            </button>
          </div>
        </div>
        {mobileNav && (
          <div className="border-t border-[#20251f]/10 bg-[#f8f2e8] px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-1 font-semibold">
              {[["#translate", "Translate"], ["#learn", "Learn"], ["#library", "Library"], ["#community", "Community"]].map(([href, label]) => <a key={href} href={href} onClick={() => setMobileNav(false)} className="rounded-xl px-3 py-3 hover:bg-white">{label}</a>)}
            </div>
          </div>
        )}
      </header>

      <main id="top">
        <section className="relative mx-auto max-w-[1380px] px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pb-24 lg:pt-20">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(440px,1.18fr)] lg:gap-16">
            <div className="relative z-10 max-w-[600px] animate-[fadeUp_650ms_cubic-bezier(.23,1,.32,1)_both]">
              <SectionEyebrow>Team Solve · Jharkhand</SectionEyebrow>
              <h1 className="max-w-[640px] font-display text-[clamp(3.5rem,8vw,7.4rem)] leading-[0.88] tracking-[-0.055em] text-[#20251f]">Keep the lesson moving, <em className="text-[#e45d32]">whether the signal does or not.</em></h1>
              <p className="mt-8 max-w-[510px] text-[17px] leading-7 text-[#566055]">Palash makes Hindi ↔ Santhali learning practical for teachers: a dependable phrasebook when offline, with stronger translation and syncing when the network returns.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a href="#translate" className="group inline-flex items-center gap-3 rounded-full bg-[#e45d32] px-5 py-3.5 font-semibold text-white shadow-[0_12px_26px_rgba(228,93,50,0.22)] transition hover:-translate-y-1 hover:bg-[#c94e2a]">Try the translator <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
                <a href="#learn" className="inline-flex items-center gap-2 rounded-full border border-[#20251f]/20 px-5 py-3.5 font-semibold text-[#20251f] transition hover:border-[#20251f]/40 hover:bg-white">See today’s lesson <ChevronRight size={17} /></a>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#20251f]/10 pt-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]">
                <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#4c956c]" /> 300+ validated phrases</span>
                <span className="flex items-center gap-2"><LockKeyhole size={12} /> No signal, no problem</span>
              </div>
            </div>
            <div className="relative animate-[fadeUp_800ms_120ms_cubic-bezier(.23,1,.32,1)_both]">
              <div className="absolute -left-4 -top-5 z-10 hidden -rotate-3 items-center gap-2 rounded-md bg-[#e45d32] px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-lg sm:flex"><span className="size-1.5 rounded-full bg-white" /> Offline-first / online-enhanced</div>
              <div className="relative aspect-[1.08] overflow-hidden rounded-[32px] bg-[#355c4f] shadow-[0_24px_70px_rgba(32,37,31,0.18)]">
                <img src={heroUrl} alt="Field notebook and tablet on a warm desk" className="h-full w-full object-cover object-center opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#20251f]/35 via-transparent to-[#e45d32]/10" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 rounded-2xl border border-white/25 bg-[#20251f]/65 p-4 text-white backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
                  <div><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">Now learning</div><div className="mt-1 font-display text-2xl">Introductions / 05</div></div>
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f8f2e8] text-[#20251f]"><Play size={17} fill="currentColor" /></div>
                </div>
              </div>
              <div className="absolute -bottom-7 -left-6 hidden w-44 rotate-2 rounded-2xl border border-[#20251f]/10 bg-[#f8f2e8] p-4 shadow-[0_16px_35px_rgba(32,37,31,0.12)] sm:block">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b746a]"><span>Daily phrases</span><span>02/05</span></div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8ded0]"><div className="h-full w-2/5 rounded-full bg-[#e45d32]" /></div>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold"><span className="grid size-5 place-items-center rounded-full bg-[#e8f1e5] text-[#2d6b4a]"><Check size={12} /></span> Keep going</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#20251f]/10 bg-[#e8f1e5]" aria-label="Product status">
          <div className="mx-auto flex max-w-[1380px] bg-[#20251f]/10">
            <div className="hidden w-12 shrink-0 flex-col items-center justify-between bg-[#20251f] py-5 text-[#f1b36d] md:flex"><span className="field-stamp field-stamp--dark">PS</span><span className="[writing-mode:vertical-rl] font-mono text-[9px] uppercase tracking-[0.2em]">field log / 01</span><span className="font-mono text-[9px]">{effectiveOnline ? "↗" : "↘"}</span></div>
            <div className="grid min-w-0 flex-1 gap-px sm:grid-cols-3">
              <div className="bg-[#e8f1e5] px-5 py-6 sm:px-8 lg:px-10"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2d6b4a]"><Activity size={13} /> Connection</div><div className="mt-2 flex flex-wrap items-baseline gap-2"><span className="font-display text-3xl text-[#20251f]">{effectiveOnline ? "Online" : "Offline"}</span><span className="text-sm text-[#566055]">{effectiveOnline ? "cloud assist active" : "core features active"}</span></div><div className="mt-4 ruled-line" /></div>
              <div className="bg-[#e8f1e5] px-5 py-6 sm:px-8 lg:px-10"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2d6b4a]"><Zap size={13} /> Sync status</div><div className="mt-2 flex flex-wrap items-baseline gap-2"><span className="font-display text-3xl text-[#20251f]">{effectiveOnline ? "Up to date" : "Saved locally"}</span><span className="text-sm text-[#566055]">{effectiveOnline ? "last sync just now" : "syncs when online"}</span></div><div className="mt-4 ruled-line" /></div>
              <div className="bg-[#e8f1e5] px-5 py-6 sm:px-8 lg:px-10"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#2d6b4a]"><BookMarked size={13} /> Your phrasebook</div><div className="mt-2 flex flex-wrap items-baseline gap-2"><span className="font-display text-3xl text-[#20251f]">{saved} saved</span><span className="text-sm text-[#566055]">available offline</span></div><div className="mt-4 ruled-line" /></div>
            </div>
          </div>
        </section>

        <section id="translate" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><SectionEyebrow>01 / Translation desk</SectionEyebrow><h2 className="font-display text-5xl leading-none tracking-[-0.04em] sm:text-6xl">Say it simply.<br /><span className="text-[#6b746a]">Teach it clearly.</span></h2></div><p className="max-w-[330px] text-sm leading-6 text-[#6b746a]">A focused workspace for the phrase you need right now. Try Hindi ↔ Santhali, then save the result to your offline phrasebook.</p></div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,0.5fr)]">
            <div className="ruled-surface overflow-hidden rounded-[28px] border border-[#20251f]/12 bg-white shadow-[0_16px_50px_rgba(32,37,31,0.07)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#20251f]/10 bg-[#fffaf3] px-5 py-4 sm:px-7"><div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b746a]"><span className={`size-2 rounded-full ${effectiveOnline ? "bg-[#4c956c]" : "bg-[#e45d32]"}`} /> {effectiveOnline ? "Online enhancement" : "Offline phrasebook"}</div><button onClick={swapDirection} className="flex items-center gap-2 rounded-full border border-[#20251f]/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition hover:border-[#e45d32] hover:text-[#e45d32]"><span>{currentLanguage}</span><ArrowLeftRight size={14} /><span>{targetLanguage}</span></button></div>
              <div className="grid md:grid-cols-2">
                <div className="border-b border-[#20251f]/10 p-6 md:border-b-0 md:border-r sm:p-8"><div className="mb-6 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9a9f97]">{currentLanguage} / type here</span><Mic size={16} className="text-[#9a9f97]" /></div><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); translatePhrase(); } }} placeholder={direction === "hi-to-sat" ? "आपका नाम क्या है?" : "आम ओल नाम दो?"} className="min-h-[120px] w-full resize-none bg-transparent font-display text-3xl leading-tight text-[#20251f] outline-none placeholder:text-[#c5bbb0] sm:text-4xl" /><div className="mt-9 flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-[#9a9f97]">Press Enter to translate</span><button onClick={translatePhrase} className="group inline-flex items-center gap-2 rounded-full bg-[#20251f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2d6b4a]">Translate <Send size={14} className="transition group-hover:translate-x-0.5" /></button></div></div>
                <div className="bg-[#f2f6ee] p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">{targetLanguage} / result</span><button onClick={toggleAudio} className={`grid size-9 place-items-center rounded-full transition ${playing ? "bg-[#e45d32] text-white" : "bg-white text-[#2d6b4a] hover:bg-[#e45d32] hover:text-white"}`} aria-label="Play pronunciation"><Headphones size={16} className={playing ? "animate-pulse" : ""} /></button></div><div className="min-h-[120px] font-display text-3xl leading-tight text-[#2d6b4a] sm:text-4xl">{translationResult}</div><div className="mt-4 flex items-center gap-2 font-mono text-[10px] leading-4 text-[#6b746a]"><span className="size-1.5 shrink-0 rounded-full bg-[#4c956c]" /> {translationNote}</div><div className="mt-9 flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-[#9a9f97]">{playing ? "Playing audio…" : "Native-speaker audio"}</span><button onClick={saveTranslation} className="inline-flex items-center gap-2 rounded-full border border-[#2d6b4a]/25 px-4 py-2.5 text-sm font-semibold text-[#2d6b4a] transition hover:bg-white"><BookMarked size={14} /> Save phrase</button></div></div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] bg-[#20251f] p-6 text-[#f8f2e8] sm:p-7"><div className="field-stamp field-stamp--dark absolute right-5 top-5">PS</div><div className="absolute -right-8 -top-8 size-36 rounded-full border border-[#f8f2e8]/10" /><div className="absolute -right-1 top-1 size-24 rounded-full border border-[#f8f2e8]/10" /><SectionEyebrow light>Phrasebook note</SectionEyebrow><div className="relative z-10 mt-8"><div className="font-display text-4xl leading-[0.98]">Cache the useful things.</div><p className="mt-5 text-sm leading-6 text-[#f8f2e8]/65">Palash remembers what you translate online, so your best lessons stay with you on the next school visit.</p><button onClick={() => comingSoon("Phrasebook manager is coming next")} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#f1b36d] transition hover:text-white">Open phrasebook <ArrowUpRight size={15} /></button></div><div className="relative z-10 mt-12 border-t border-[#f8f2e8]/15 pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#f8f2e8]/55"><div className="flex justify-between"><span>Storage used</span><span>18 / 50 MB</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-[#f8f2e8]/15"><div className="h-full w-[36%] rounded-full bg-[#e45d32]" /></div></div></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">{phrases.slice(0, 4).map((phrase) => <button key={phrase.hindi} onClick={() => { setInput(direction === "hi-to-sat" ? phrase.hindi : phrase.santhali); setTranslation(direction === "hi-to-sat" ? phrase.santhali : phrase.hindi); setTranslationNote("Validated phrase · cached for offline use"); }} className="rounded-full border border-[#20251f]/12 bg-white/55 px-3 py-2 text-sm text-[#566055] transition hover:border-[#e45d32] hover:bg-white hover:text-[#20251f]">{direction === "hi-to-sat" ? phrase.hindi : phrase.santhali}</button>)}</div>
        </section>

        <section id="learn" className="scroll-mt-24 border-y border-[#20251f]/10 bg-[#2d6b4a] text-[#f8f2e8]">
          <div className="mx-auto grid max-w-[1380px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-12 lg:py-28">
            <div><SectionEyebrow light>02 / Teacher learning</SectionEyebrow><h2 className="max-w-[450px] font-display text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">Five phrases.<br /><span className="text-[#f1b36d]">One stronger classroom.</span></h2><p className="mt-6 max-w-[390px] text-[15px] leading-7 text-[#f8f2e8]/70">A small, repeatable daily rhythm built for real teaching days. Complete a phrase, listen once, and carry the new words into your next lesson.</p><div className="mt-10 flex items-center gap-5"><div className="relative grid size-24 place-items-center rounded-full border border-[#f8f2e8]/25" style={{ background: `conic-gradient(#f1b36d ${lessonPercent * 3.6}deg, transparent 0)` }}><div className="grid size-[76px] place-items-center rounded-full bg-[#2d6b4a] font-display text-2xl">{lessonPercent}%</div></div><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8f2e8]/55">Today’s progress</div><div className="mt-1 text-lg font-semibold">{completed.length} of {phrases.length} complete</div></div></div></div>
            <div className="ruled-surface relative rounded-[28px] border border-[#f8f2e8]/15 bg-[#f8f2e8]/[0.08] p-5 sm:p-7"><div className="field-stamp field-stamp--light absolute right-5 top-5">PS</div><div className="mb-5 flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8f2e8]/55">Lesson 04 / 18</div><div className="mt-1 font-display text-2xl">Introductions</div></div><div className="rounded-full bg-[#f1b36d] px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#20251f]">12 min</div></div><div className="divide-y divide-[#f8f2e8]/10">{phrases.map((phrase, index) => <div key={phrase.hindi} className="flex items-center gap-4 py-4 first:pt-2"><button onClick={() => toggleLesson(index)} className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${completed.includes(index) ? "border-[#f1b36d] bg-[#f1b36d] text-[#20251f]" : "border-[#f8f2e8]/30 text-transparent hover:border-[#f1b36d]"}`} aria-label={`${completed.includes(index) ? "Uncomplete" : "Complete"} phrase`}><Check size={15} strokeWidth={3} /></button><div className="min-w-0 flex-1"><div className={`font-semibold transition ${completed.includes(index) ? "text-[#f8f2e8]/50 line-through" : "text-[#f8f2e8]"}`}>{phrase.hindi}</div><div className="mt-1 font-mono text-[10px] text-[#f8f2e8]/45">{phrase.santhali}</div></div><button onClick={toggleAudio} className="grid size-8 place-items-center rounded-full border border-[#f8f2e8]/15 text-[#f1b36d] transition hover:border-[#f1b36d] hover:bg-[#f1b36d] hover:text-[#20251f]" aria-label="Play lesson audio"><Play size={12} fill="currentColor" /></button></div>)}</div><button onClick={() => { document.getElementById("translate")?.scrollIntoView({ behavior: "smooth" }); setInput(phrases[2].hindi); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#f8f2e8] py-3 text-sm font-semibold text-[#2d6b4a] transition hover:bg-[#f1b36d]">Practice these phrases <ArrowUpRight size={15} /></button></div>
          </div>
        </section>

        <section id="library" className="mx-auto max-w-[1380px] scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid items-end gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><SectionEyebrow>03 / Offline library</SectionEyebrow><h2 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">Your classroom,<br /><span className="text-[#e45d32]">carried with you.</span></h2></div><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><p className="max-w-[390px] text-[15px] leading-6 text-[#6b746a]">Download the books you need on a good connection. They stay readable, searchable, and ready for the next visit.</p><button onClick={() => comingSoon("Full library search is coming next")} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#20251f]/15 px-4 py-3 text-sm font-semibold transition hover:border-[#e45d32] hover:text-[#e45d32]"><Search size={15} /> Browse all books</button></div></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">{library.map((book, index) => <article key={book.title} className="group overflow-hidden rounded-[24px] border border-[#20251f]/10 bg-white shadow-[0_12px_35px_rgba(32,37,31,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(32,37,31,0.1)]"><div className={`relative h-44 overflow-hidden ${index === 0 ? "bg-[#e8ded0]" : index === 1 ? "bg-[#dcebdc]" : "bg-[#313d63]"}`}>{index === 0 ? <img src={book.image} alt="" className="h-full w-full object-cover opacity-75 mix-blend-multiply transition duration-500 group-hover:scale-105" /> : index === 1 ? <div className="absolute inset-0 p-5"><div className="h-full rounded-[12px] border border-[#2d6b4a]/25 bg-[#f8f2e8]/80 p-4 shadow-[5px_5px_0_rgba(45,107,74,0.12)]"><div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[#2d6b4a]"><span>Field file</span><NotebookPen size={14} /></div><div className="mt-5 font-display text-5xl leading-none text-[#2d6b4a]">अ</div><div className="mt-3 space-y-2"><div className="h-px w-4/5 bg-[#2d6b4a]/25" /><div className="h-px w-3/5 bg-[#2d6b4a]/20" /></div></div></div> : <div className="absolute inset-0 overflow-hidden p-5"><div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#f8f2e8_1px,transparent_1px),linear-gradient(90deg,#f8f2e8_1px,transparent_1px)] [background-size:20px_20px]" /><div className="relative flex h-full items-end justify-between"><div><div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#f8f2e8]/55">Teacher guide</div><div className="mt-2 font-display text-4xl text-[#f1b36d]">01—08</div></div><BookOpen size={40} strokeWidth={1.2} className="text-[#f8f2e8]/70" /></div></div>}<div className={`absolute left-4 top-4 rounded-full px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] ${book.color === "orange" ? "bg-[#e45d32] text-white" : book.color === "green" ? "bg-[#dcebdc] text-[#2d6b4a]" : "bg-[#313d63] text-white"}`}>Class {index + 1}</div><div className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-[#f8f2e8]/90 text-[#20251f] shadow-lg"><BookOpen size={17} /></div></div><div className="p-5"><div className="font-display text-2xl">{book.title}</div><div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#9a9f97]">{book.meta}</div><div className="mt-6 flex items-center justify-between"><span className={`flex items-center gap-2 text-xs font-semibold ${downloaded.includes(index) ? "text-[#2d6b4a]" : "text-[#6b746a]"}`}>{downloaded.includes(index) ? <><span className="grid size-5 place-items-center rounded-full bg-[#e8f1e5]"><Check size={12} /></span> Available offline</> : "Cloud library"}</span><button onClick={() => toggleDownload(index)} className="grid size-9 place-items-center rounded-full border border-[#20251f]/15 transition hover:border-[#e45d32] hover:bg-[#fff0e7] hover:text-[#e45d32]" aria-label={`Download ${book.title}`}>{downloaded.includes(index) ? <Check size={15} /> : <Download size={15} />}</button></div></div></article>)}</div>
        </section>

        <section id="community" className="scroll-mt-24 bg-[#f1b36d]">
          <div className="mx-auto grid max-w-[1380px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24 lg:px-12 lg:py-24"><div><SectionEyebrow>04 / Growing together</SectionEyebrow><h2 className="max-w-[680px] font-display text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl">A language library built <span className="text-[#2d6b4a]">with the community.</span></h2><p className="mt-6 max-w-[570px] text-[16px] leading-7 text-[#4c4a3b]">Teachers and native speakers can suggest better phrases, record audio, and help the repository grow — with language experts reviewing every contribution.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => comingSoon("Community contributions are coming next")} className="inline-flex items-center gap-2 rounded-full bg-[#20251f] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2d6b4a]">Share a phrase <PlusIcon /></button><button onClick={() => comingSoon("The discussion space is coming next")} className="inline-flex items-center gap-2 rounded-full border border-[#20251f]/20 px-5 py-3.5 text-sm font-semibold transition hover:bg-[#f8f2e8]">Visit the forum <ArrowUpRight size={16} /></button></div></div><div className="relative aspect-[1.25] overflow-hidden rounded-[28px] bg-[#d9a15f] shadow-[0_20px_50px_rgba(32,37,31,0.12)]"><img src={teacherUrl} alt="Teacher practicing language learning" className="h-full w-full object-cover" /><div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-[#f8f2e8]/90 p-3 backdrop-blur-md"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#2d6b4a] text-[#f8f2e8]"><Leaf size={16} /></div><div><div className="text-sm font-semibold text-[#20251f]">Community verified</div><div className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#6b746a]">Review · record · share</div></div></div></div></div>
        </section>
      </main>

      <footer className="bg-[#20251f] text-[#f8f2e8]">
        <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16"><div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-start"><div><AppMark compact /><p className="mt-5 max-w-[290px] text-sm leading-6 text-[#f8f2e8]/55">An offline-first, online-enhanced language bridge for teachers and tribal communities in Jharkhand.</p></div><div className="grid grid-cols-2 gap-x-12 gap-y-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f8f2e8]/55"><a href="#translate" className="transition hover:text-[#f1b36d]">Translate</a><a href="#learn" className="transition hover:text-[#f1b36d]">Teacher mode</a><a href="#library" className="transition hover:text-[#f1b36d]">PDF library</a><a href="#community" className="transition hover:text-[#f1b36d]">Community</a></div></div><div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#f8f2e8]/10 pt-5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#f8f2e8]/35 sm:flex-row"><span>Team Solve · Prototype 01</span><span>Made for the lessons that keep going</span></div></div>
      </footer>
    </div>
  );
}

function PlusIcon() {
  return <span className="grid size-4 place-items-center rounded-full bg-[#e45d32] text-white"><span className="text-[14px] leading-none">+</span></span>;
}
