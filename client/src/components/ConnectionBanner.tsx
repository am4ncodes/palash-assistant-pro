import { AlertCircle, CheckCircle2, RefreshCw, WifiOff } from "lucide-react";
import { useConnectionStatus } from "@/contexts/ConnectionStatus";

export default function ConnectionBanner() {
  const { state, retry } = useConnectionStatus();
  if (state === "online") return null;
  const offline = state === "offline";
  return <div role="status" aria-live="polite" className={`border-b px-5 py-3 text-sm ${offline ? "border-[#e45d32]/25 bg-[#fff0e7] text-[#8c3c22]" : "border-[#d49b35]/30 bg-[#fff7dc] text-[#7a5b1d]"}`}><div className="mx-auto flex max-w-[1380px] flex-wrap items-center justify-between gap-3 sm:px-3"><div className="flex items-center gap-2 font-semibold">{offline ? <WifiOff size={16} /> : <RefreshCw size={16} className="animate-spin" />}<span>{offline ? "You’re offline. Local lessons and saved notes are still available." : "Connection interrupted. We’re retrying your last request."}</span></div><button onClick={() => void retry()} className="inline-flex items-center gap-2 rounded-full border border-current/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/50"><AlertCircle size={13} /> Retry now</button></div></div>;
}
