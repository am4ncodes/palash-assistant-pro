/* Feature module: moderated community contribution workspace. */
import { useState } from "react";
import { Check, ChevronRight, Clock3, Edit3, Headphones, Leaf, Mic, ShieldCheck, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useAppStore } from "@/contexts/AppStore";

const pathways = [
  { icon: Mic, title: "Record audio", description: "Help learners hear the phrase the way it is spoken locally.", accent: "bg-[#f1b36d]" },
  { icon: Sparkles, title: "Suggest a phrase", description: "Share a clearer translation for a classroom situation.", accent: "bg-[#e8f1e5]" },
  { icon: Users, title: "Join a circle", description: "Exchange practical teaching notes with PALASH teachers.", accent: "bg-[#d8def1]" },
];

type Draft = { id: string; text: string; source: string; status: "Draft" | "Queued" | "Needs context"; createdAt: string };

export default function CommunityPage() {
  const { publishEvent } = useAppStore();
  const [contribution, setContribution] = useState("");
  const [source, setSource] = useState("Teacher note");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>(() => { try { return JSON.parse(window.localStorage.getItem("palash-community-drafts") || "[]"); } catch { return []; } });

  function persist(next: Draft[]) { setDrafts(next); window.localStorage.setItem("palash-community-drafts", JSON.stringify(next)); }
  function submitContribution() {
    if (!contribution.trim()) { toast("Write a phrase first", { description: "A contribution needs a little context before it can be reviewed." }); return; }
    const nextDraft: Draft = { id: editingId ?? crypto.randomUUID(), text: contribution.trim(), source, status: "Queued", createdAt: new Date().toISOString() };
    const next = editingId ? drafts.map((draft) => draft.id === editingId ? nextDraft : draft) : [nextDraft, ...drafts];
    persist(next); publishEvent("community:contribution-submitted"); setContribution(""); setEditingId(null); toast.success("Contribution queued for expert review", { description: "The local timeline now records its provenance and status." });
  }
  function editDraft(draft: Draft) { setEditingId(draft.id); setContribution(draft.text); setSource(draft.source); window.scrollTo({ top: 240, behavior: "smooth" }); }

  return <AppShell>
    <main className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <div className="section-eyebrow">Feature / 04 · Community</div>
          <h1 className="font-display text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">Built with<br /><span className="text-[#2d6b4a]">many voices.</span></h1>
          <p className="mt-7 max-w-[470px] text-[16px] leading-7 text-[#566055]">Palash grows through careful contributions from teachers, native speakers, and language experts. Every new phrase should be useful, respectful, and traceable.</p>
          <div className="mt-10 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-[#20251f]/10 bg-white p-4"><ShieldCheck size={18} className="text-[#2d6b4a]" /><div className="mt-6 font-display text-3xl">100%</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b746a]">Expert reviewed</div></div><div className="rounded-2xl border border-[#20251f]/10 bg-[#e8f1e5] p-4"><Leaf size={18} className="text-[#2d6b4a]" /><div className="mt-6 font-display text-3xl">CC-BY-NC</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b746a]">Community license</div></div></div>
        </div>
        <div className="rounded-[28px] bg-[#f1b36d] p-6 shadow-[0_18px_45px_rgba(32,37,31,0.1)] sm:p-9">
          <div className="flex items-start justify-between gap-5"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4c4a3b]">Contribution desk / {editingId ? "edit" : "01"}</div><h2 className="mt-2 font-display text-4xl leading-none text-[#20251f]">Share a phrase<br />from the field.</h2></div><div className="field-stamp border-[#20251f] text-[#20251f]">PS</div></div>
          <div className="mt-8 rounded-2xl border border-[#20251f]/15 bg-[#f8f2e8]/80 p-5"><label htmlFor="contribution" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">Hindi phrase or teaching note</label><textarea id="contribution" value={contribution} onChange={(event) => setContribution(event.target.value)} placeholder="Write a phrase and where you use it…" className="mt-5 min-h-[125px] w-full resize-none bg-transparent font-display text-3xl leading-tight outline-none placeholder:text-[#b8a88f]" /><div className="mt-4 flex flex-wrap items-center gap-2"><label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b746a]">Source <select value={source} onChange={(event) => setSource(event.target.value)} className="ml-1 rounded-full border border-[#20251f]/15 bg-white px-2 py-1"><option>Teacher note</option><option>Native speaker</option><option>Community workshop</option></select></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#20251f]/10 pt-4"><span className="font-mono text-[10px] text-[#6b746a]">Saved locally until review</span><div className="flex gap-2">{editingId && <button onClick={() => { setEditingId(null); setContribution(""); }} className="rounded-full border border-[#20251f]/15 px-4 py-2.5 text-sm">Cancel</button>}<button onClick={submitContribution} className="inline-flex items-center gap-2 rounded-full bg-[#20251f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2d6b4a]">{editingId ? "Update submission" : "Submit for review"} <ChevronRight size={15} /></button></div></div></div>
          <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#4c4a3b]"><ShieldCheck size={14} /> Moderated before publishing</div>
        </div>
      </div>
      <section className="mt-14 rounded-[24px] border border-[#20251f]/10 bg-white p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="section-eyebrow">Contribution ledger</div><h2 className="font-display text-4xl">Trace every voice.</h2></div><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6b746a]">{drafts.length} local records</span></div>{drafts.length ? <div className="mt-6 space-y-3">{drafts.map((draft) => <article key={draft.id} className="rounded-2xl border border-[#20251f]/10 bg-[#fffaf3] p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="font-display text-2xl">{draft.text}</div><div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]"><span>{draft.source}</span><span>·</span><span>{new Date(draft.createdAt).toLocaleDateString()}</span><span className="rounded-full bg-[#fff0e7] px-2 py-1 text-[#e45d32]">{draft.status}</span></div></div><button onClick={() => editDraft(draft)} className="inline-flex items-center gap-2 rounded-full border border-[#20251f]/15 px-3 py-2 text-xs font-semibold"><Edit3 size={13} /> Edit</button></div><div className="mt-4 flex items-center gap-2 border-t border-[#20251f]/10 pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]"><Clock3 size={13} /> Submitted locally → moderation queue → publish decision</div></article>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-[#20251f]/15 p-8 text-center text-sm text-[#6b746a]">Your contribution drafts and moderation updates will appear here.</div>}</section>
      <section className="mt-20 border-t border-[#20251f]/10 pt-10"><div className="flex flex-wrap items-end justify-between gap-6"><div><div className="section-eyebrow">Ways to contribute</div><h2 className="font-display text-5xl leading-none">Make the library<br /><span className="text-[#e45d32]">more useful.</span></h2></div><p className="max-w-[320px] text-sm leading-6 text-[#6b746a]">The first release keeps contribution lightweight, with provenance and moderation states visible from the beginning.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{pathways.map(({ icon: Icon, title, description, accent }) => <button key={title} onClick={() => toast(title, { description: "This pathway is mapped for the next product phase." })} className={`group rounded-[22px] border border-[#20251f]/10 ${accent} p-6 text-left transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(32,37,31,0.1)]`}><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-full bg-[#f8f2e8]/80 text-[#20251f]"><Icon size={18} /></span><ChevronRight size={17} className="transition group-hover:translate-x-1" /></div><div className="mt-12 font-display text-3xl">{title}</div><div className="mt-2 text-sm leading-6 text-[#4c4a3b]">{description}</div></button>)}</div></section>
      <section className="mt-20 grid gap-5 border-t border-[#20251f]/10 pt-10 md:grid-cols-3"><div className="md:col-span-2"><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b746a]">Knowledge commons / current principles</div><blockquote className="mt-5 max-w-[800px] font-display text-4xl leading-[1.05] tracking-[-0.03em] text-[#2d6b4a]">“A good contribution is one a teacher can use tomorrow, and a language expert can stand behind.”</blockquote></div><div className="rounded-2xl border border-[#20251f]/10 bg-white p-5"><Headphones size={17} className="text-[#e45d32]" /><div className="mt-5 font-semibold">Audio contributions</div><div className="mt-2 text-sm leading-6 text-[#6b746a]">Native-speaker recordings will be reviewed for clarity, consent, and context before they reach the shared library.</div></div></section>
    </main>
  </AppShell>;
}
