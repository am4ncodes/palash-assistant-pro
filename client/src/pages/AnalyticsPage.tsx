/*
 * Analytics — UI prototype using illustrative sample data (clearly not live metrics).
 * Demonstrates the widget/dashboard pattern with simple CSS bar/line rendering,
 * no charting library dependency needed.
 */
import AppShell from "@/components/AppShell";

const WEEKLY = [12, 19, 14, 22, 28, 17, 25];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORIES = [
  { label: "Translations", value: 64, color: "#e45d32" },
  { label: "Lessons drafted", value: 41, color: "#2d6b4a" },
  { label: "Documents scanned", value: 23, color: "#8a5a12" },
  { label: "Chat sessions", value: 37, color: "#4a5a8a" },
];

const STATS = [
  { label: "Active this week", value: "128" },
  { label: "Avg. session length", value: "6m 40s" },
  { label: "Offline syncs", value: "19" },
  { label: "Languages used", value: "5" },
];

export default function AnalyticsPage() {
  const max = Math.max(...WEEKLY);
  return (
    <AppShell>
      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="sohrai-rule mb-6" aria-hidden="true" />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e45d32]">Insights</p>
        <h1 className="mt-2 font-display text-[32px] sm:text-[40px]">Your activity, at a glance</h1>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="field-card p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6b746a]">{s.label}</p>
              <p className="mt-1 font-display text-[26px]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="field-card p-6">
            <h2 className="font-display text-[18px]">Weekly usage</h2>
            <div className="mt-6 flex h-40 items-end gap-3">
              {WEEKLY.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-[#e45d32] transition-all"
                    style={{ height: `${(v / max) * 100}%` }}
                    role="img"
                    aria-label={`${DAYS[i]}: ${v} sessions`}
                  />
                  <span className="font-mono text-[10px] text-[#6b746a]">{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="field-card p-6">
            <h2 className="font-display text-[18px]">By category</h2>
            <div className="mt-5 space-y-4">
              {CATEGORIES.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>{c.label}</span>
                    <span className="text-[#6b746a]">{c.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-[#f1e9db] dark:bg-[#232922]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${c.value}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]">Prototype — sample data for layout demonstration.</p>
      </main>
    </AppShell>
  );
}
