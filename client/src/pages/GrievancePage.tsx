/*
 * Grievance Redressal — a real, working ticket tracker.
 * Tickets persist in localStorage. No fabricated government backend is implied;
 * this is a local logbook a teacher/citizen can use to track their own complaints.
 */
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Plus, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";

type Status = "Filed" | "In review" | "Resolved";
type Ticket = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: Status;
  createdAt: number;
};

const STORAGE_KEY = "palash.grievances.v1";
const CATEGORIES = ["Water supply", "Electricity", "Roads", "Ration/PDS", "Education", "Healthcare", "Other"];

function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function statusMeta(status: Status) {
  if (status === "Resolved") return { icon: CheckCircle2, color: "#2d6b4a", bg: "#e8f1e5" };
  if (status === "In review") return { icon: Clock3, color: "#8a5a12", bg: "#f6ecd6" };
  return { icon: AlertCircle, color: "#e45d32", bg: "#fbe6dc" };
}

export default function GrievancePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTickets(loadTickets());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  function submitTicket(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const ticket: Ticket = {
      id: `GRV-${Date.now().toString(36).toUpperCase()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      status: "Filed",
      createdAt: Date.now(),
    };
    setTickets((prev) => [ticket, ...prev]);
    setTitle("");
    setDescription("");
  }

  function advanceStatus(id: string) {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== id) return ticket;
        const next: Status = ticket.status === "Filed" ? "In review" : ticket.status === "In review" ? "Resolved" : "Resolved";
        return { ...ticket, status: next };
      }),
    );
  }

  function removeTicket(id: string) {
    setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="sohrai-rule mb-6" aria-hidden="true" />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e45d32]">Grievance log</p>
        <h1 className="mt-2 font-display text-[32px] leading-tight sm:text-[40px]">Track a complaint, start to finish</h1>
        <p className="mt-3 max-w-[62ch] text-[15px] text-[#4b5248]">
          File an issue, watch it move through review, and keep a record you can revisit — even offline. Your entries
          are stored on this device only.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form onSubmit={submitTicket} className="field-card h-fit p-5">
            <h2 className="font-display text-[18px]">File a new grievance</h2>
            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="grv-title">Title</label>
            <input
              id="grv-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. No water supply for 5 days"
              className="field-input mt-1"
              required
            />
            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="grv-category">Category</label>
            <select id="grv-category" value={category} onChange={(event) => setCategory(event.target.value)} className="field-input mt-1">
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]" htmlFor="grv-desc">Details</label>
            <textarea
              id="grv-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Describe what happened, where, and since when."
              className="field-input mt-1 resize-none"
            />
            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#e45d32] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#c94e28]">
              <Plus size={14} /> Submit grievance
            </button>
          </form>

          <div className="space-y-3">
            {tickets.length === 0 && (
              <div className="field-card p-8 text-center text-[14px] text-[#6b746a]">No grievances filed yet. Your first entry will appear here.</div>
            )}
            {tickets.map((ticket) => {
              const meta = statusMeta(ticket.status);
              const Icon = meta.icon;
              return (
                <div key={ticket.id} className="field-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]">{ticket.id} · {ticket.category}</p>
                      <h3 className="mt-1 font-display text-[19px]">{ticket.title}</h3>
                      {ticket.description && <p className="mt-1 text-[13px] text-[#4b5248]">{ticket.description}</p>}
                    </div>
                    <button onClick={() => removeTicket(ticket.id)} aria-label={`Delete ${ticket.title}`} className="shrink-0 rounded-full p-2 text-[#6b746a] hover:bg-[#f1e9db] hover:text-[#e45d32]">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: meta.color, backgroundColor: meta.bg }}
                    >
                      <Icon size={12} /> {ticket.status}
                    </span>
                    {ticket.status !== "Resolved" && (
                      <button onClick={() => advanceStatus(ticket.id)} className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2d6b4a] hover:underline">
                        Move to next stage →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
