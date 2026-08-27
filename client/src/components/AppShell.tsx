/*
 * Architecture: shared chrome lives here, while route pages own their feature content.
 * This keeps every page independently loadable and gives future framework migration
 * one obvious layout boundary.
 */
import { Activity, ArrowUpRight, Wifi, WifiOff } from "lucide-react";
import { Link } from "@/lib/router";
import { useAppStore } from "@/contexts/AppStore";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { savedPhrases, lastAction } = useAppStore();
  const online = navigator.onLine;

  return (
    <div className="min-h-screen bg-[#f8f2e8] text-[#20251f]">
      <header className="sticky top-0 z-40 border-b border-[#20251f]/10 bg-[#f8f2e8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-3" aria-label="Palash dashboard">
            <span className="palash-stamp palash-stamp--compact"><span className="font-mono text-[9px] font-semibold text-white">PS</span></span>
            <span className="leading-none"><span className="font-display text-[18px]">Palash</span><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.18em] text-[#6b746a]">assistant / app</span></span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Application navigation">
            <Link to="/translate" className="nav-link">Translate</Link>
            <Link to="/learn" className="nav-link">Learn</Link>
            <Link to="/library" className="nav-link">Library</Link>
            <Link to="/community" className="nav-link">Community</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/features" className="nav-link">Product map</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#9bc2a3] bg-[#e8f1e5] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2d6b4a] sm:flex">{online ? <Wifi size={13} /> : <WifiOff size={13} />}{online ? "Online assist" : "Offline ready"}</div>
            <Link to="/profile" className="grid size-10 place-items-center rounded-full bg-[#20251f] text-xs font-semibold text-white" aria-label="Open profile">PS</Link>
          </div>
        </div>
      </header>
      <nav className="flex gap-5 overflow-x-auto border-b border-[#20251f]/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a] lg:hidden" aria-label="Mobile application navigation"><Link to="/translate" className="shrink-0 hover:text-[#e45d32]">Translate</Link><Link to="/learn" className="shrink-0 hover:text-[#e45d32]">Learn</Link><Link to="/library" className="shrink-0 hover:text-[#e45d32]">Library</Link><Link to="/community" className="shrink-0 hover:text-[#e45d32]">Community</Link><Link to="/profile" className="shrink-0 hover:text-[#e45d32]">Profile</Link><Link to="/features" className="shrink-0 hover:text-[#e45d32]">Product map</Link></nav>
      <div className="mx-auto flex max-w-[1380px] items-center justify-between border-b border-[#20251f]/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a] sm:px-8 lg:px-12"><span className="flex items-center gap-2"><Activity size={13} className="text-[#e45d32]" /> {lastAction}</span><span>{savedPhrases} saved phrases <ArrowUpRight size={12} className="ml-1 inline" /></span></div>
      {children}
    </div>
  );
}
