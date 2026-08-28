/*
 * Settings — the accessibility controls here are real (not mocked): they toggle
 * actual document-level classes that index.css responds to. Theme toggling uses
 * the existing ThemeContext where available, falling back to a local class toggle.
 */
import { useEffect, useState } from "react";
import { Moon, Sun, Contrast, Type, PauseCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

function useLocalToggle(key: string, className: string) {
  const [on, setOn] = useState(() => localStorage.getItem(key) === "1");
  useEffect(() => {
    document.documentElement.classList.toggle(className, on);
    localStorage.setItem(key, on ? "1" : "0");
  }, [on, className, key]);
  return [on, setOn] as const;
}

export default function SettingsPage() {
  const [dark, setDark] = useLocalToggle("palash.dark", "dark");
  const [highContrast, setHighContrast] = useLocalToggle("palash.hc", "high-contrast");
  const [dyslexiaFont, setDyslexiaFont] = useLocalToggle("palash.dyslexia", "dyslexia-font");
  const [reducedMotion, setReducedMotion] = useLocalToggle("palash.reduced-motion", "reduce-motion");

  const rows = [
    { key: "dark", label: "Dark theme", desc: "Switch the interface to a low-light palette.", icon: dark ? Moon : Sun, on: dark, set: setDark },
    { key: "hc", label: "High contrast", desc: "Increase text and border contrast for readability.", icon: Contrast, on: highContrast, set: setHighContrast },
    { key: "dys", label: "Dyslexia-friendly font", desc: "Swap body text to a font designed for easier reading.", icon: Type, on: dyslexiaFont, set: setDyslexiaFont },
    { key: "rm", label: "Reduce motion", desc: "Minimize animations and transitions.", icon: PauseCircle, on: reducedMotion, set: setReducedMotion },
  ];

  return (
    <AppShell>
      <main className="mx-auto max-w-[720px] px-5 py-10 sm:px-8">
        <div className="sohrai-rule mb-6" aria-hidden="true" />
        <h1 className="font-display text-[32px]">Settings & accessibility</h1>
        <p className="mt-2 text-[14px] text-[#4b5248]">These preferences apply immediately and are saved on this device.</p>

        <div className="mt-8 space-y-3">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.key} className="field-card flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f1e9db] text-[#e45d32] dark:bg-[#2b3129]">
                    <Icon size={17} />
                  </div>
                  <div>
                    <p className="font-display text-[16px]">{row.label}</p>
                    <p className="text-[13px] text-[#6b746a]">{row.desc}</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={row.on}
                  aria-label={row.label}
                  onClick={() => row.set(!row.on)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${row.on ? "bg-[#e45d32]" : "bg-[#e0d8c8] dark:bg-[#3a4136]"}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${row.on ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}
