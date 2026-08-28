/*
 * Scheme Eligibility Checker — real client-side logic against a small,
 * clearly-labeled reference dataset of well-known scheme rules of thumb.
 * Not connected to a live government database; framed honestly as guidance.
 */
import { useMemo, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

type Scheme = {
  name: string;
  summary: string;
  check: (input: Inputs) => boolean;
  reason: string;
};

type Inputs = {
  age: number;
  incomeLakh: number;
  occupation: string;
  hasLand: boolean;
  category: string;
};

const SCHEMES: Scheme[] = [
  {
    name: "PM-KISAN",
    summary: "Income support for landholding farmer families.",
    check: (i) => i.hasLand && i.occupation === "Farmer",
    reason: "Requires cultivable landholding and farming as occupation.",
  },
  {
    name: "National Old Age Pension",
    summary: "Monthly pension for senior citizens from BPL households.",
    check: (i) => i.age >= 60 && i.incomeLakh <= 1,
    reason: "Requires age 60+ and household income within BPL range (reference threshold).",
  },
  {
    name: "Sukanya Samriddhi Yojana",
    summary: "Savings scheme for the girl child, opened before age 10.",
    check: (i) => i.age < 10,
    reason: "Account must be opened before the child turns 10.",
  },
  {
    name: "MNREGA Job Card",
    summary: "Guaranteed 100 days of rural wage employment per household.",
    check: (i) => i.age >= 18 && i.incomeLakh <= 3,
    reason: "Adult member of a rural household seeking manual work.",
  },
  {
    name: "Post-Matric Scholarship (ST/SC/OBC)",
    summary: "Tuition and maintenance support for students from reserved categories.",
    check: (i) => ["ST", "SC", "OBC"].includes(i.category) && i.incomeLakh <= 2.5,
    reason: "Category-based scholarship with an income ceiling (reference threshold).",
  },
];

export default function SchemesPage() {
  const [age, setAge] = useState(30);
  const [incomeLakh, setIncomeLakh] = useState(1.5);
  const [occupation, setOccupation] = useState("Farmer");
  const [hasLand, setHasLand] = useState(true);
  const [category, setCategory] = useState("General");
  const [checked, setChecked] = useState(false);

  const inputs: Inputs = { age, incomeLakh, occupation, hasLand, category };
  const results = useMemo(() => SCHEMES.map((scheme) => ({ scheme, eligible: scheme.check(inputs) })), [age, incomeLakh, occupation, hasLand, category]);

  return (
    <AppShell>
      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="sohrai-rule mb-6" aria-hidden="true" />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e45d32]">Eligibility guide</p>
        <h1 className="mt-2 font-display text-[32px] leading-tight sm:text-[40px]">Which schemes might apply to you</h1>
        <p className="mt-3 flex max-w-[62ch] items-start gap-2 text-[14px] text-[#4b5248]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#8a5a12]" />
          This is a plain-language reference check, not an official application. Always confirm final eligibility at your local CSC or e-District office.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={(event) => { event.preventDefault(); setChecked(true); }}
            className="field-card h-fit p-5"
          >
            <h2 className="font-display text-[18px]">Your details</h2>

            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="age">Age: {age}</label>
            <input id="age" type="range" min={0} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-2 w-full accent-[#e45d32]" />

            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="income">Household income (₹ lakh/yr): {incomeLakh}</label>
            <input id="income" type="range" min={0} max={10} step={0.5} value={incomeLakh} onChange={(e) => setIncomeLakh(Number(e.target.value))} className="mt-2 w-full accent-[#e45d32]" />

            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="occupation">Occupation</label>
            <select id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="field-input mt-1">
              {["Farmer", "Student", "Salaried", "Self-employed", "Unemployed", "Retired"].map((o) => <option key={o}>{o}</option>)}
            </select>

            <label className="mt-4 flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={hasLand} onChange={(e) => setHasLand(e.target.checked)} className="accent-[#e45d32]" />
              Owns cultivable land
            </label>

            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="field-input mt-1">
              {["General", "OBC", "SC", "ST"].map((c) => <option key={c}>{c}</option>)}
            </select>

            <button type="submit" className="mt-5 w-full rounded-full bg-[#e45d32] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#c94e28]">
              Check eligibility
            </button>
          </form>

          <div className="space-y-3">
            {!checked && <div className="field-card p-8 text-center text-[14px] text-[#6b746a]">Fill in your details and check to see results here.</div>}
            {checked && results.map(({ scheme, eligible }) => (
              <div key={scheme.name} className="field-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[18px]">{scheme.name}</h3>
                    <p className="mt-1 text-[13px] text-[#4b5248]">{scheme.summary}</p>
                  </div>
                  {eligible ? <CheckCircle2 className="shrink-0 text-[#2d6b4a]" size={22} /> : <XCircle className="shrink-0 text-[#b5453a]" size={22} />}
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6b746a]">{eligible ? "Likely eligible — " : "Likely not eligible — "}{scheme.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
