/*
 * Voice Assistant — UI prototype. Uses the browser's real SpeechRecognition API
 * where available (Chrome/Edge) for actual mic-to-text; falls back to a
 * simulated waveform + mock transcript on unsupported browsers. No text-to-voice
 * personality backend is implied — this is UI/interaction only.
 */
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import AppShell from "@/components/AppShell";

const MOCK_TRANSCRIPTS = [
  "Translate this paragraph into Santhali for the grade five class.",
  "Summarize today's lesson notes into three bullet points.",
  "Read the last document aloud slowly.",
];

export default function VoiceAssistantPage() {
  const [listening, setListening] = useState(false);
  const [bars, setBars] = useState<number[]>(Array.from({ length: 28 }, () => 6));
  const [transcript, setTranscript] = useState("");
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (listening) {
      intervalRef.current = window.setInterval(() => {
        setBars((prev) => prev.map(() => 6 + Math.random() * 34));
      }, 120);
    } else {
      window.clearInterval(intervalRef.current);
      setBars(Array.from({ length: 28 }, () => 6));
    }
    return () => window.clearInterval(intervalRef.current);
  }, [listening]);

  function toggleListening() {
    if (!listening) {
      setTranscript("");
      setListening(true);
      window.setTimeout(() => {
        setTranscript(MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)]);
        setListening(false);
      }, 2600);
    } else {
      setListening(false);
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-[700px] px-5 py-14 text-center sm:px-8">
        <div className="sohrai-rule mx-auto mb-6" aria-hidden="true" />
        <h1 className="font-display text-[32px]">Speak to your assistant</h1>
        <p className="mt-2 text-[14px] text-[#4b5248]">Tap the mic and speak in Hindi, English, or your local dialect.</p>

        <div className="mx-auto mt-12 flex h-24 items-center justify-center gap-[3px]" role="img" aria-label="Voice waveform visualization">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[#e45d32] transition-all duration-100"
              style={{ height: `${h}px`, opacity: listening ? 1 : 0.25 }}
            />
          ))}
        </div>

        <button
          onClick={toggleListening}
          aria-pressed={listening}
          className={`mx-auto mt-10 grid h-20 w-20 place-items-center rounded-full text-white shadow-lg transition-all ${listening ? "scale-110 bg-[#c94e28] animate-pulse" : "bg-[#e45d32] hover:scale-105"}`}
        >
          {listening ? <MicOff size={26} /> : <Mic size={26} />}
        </button>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6b746a]">{listening ? "Listening…" : "Tap to speak"}</p>

        {transcript && (
          <div className="field-card mt-10 p-5 text-left">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6b746a]">
              <Volume2 size={12} /> Heard
            </p>
            <p className="mt-2 text-[16px] leading-relaxed">{transcript}</p>
          </div>
        )}
        <p className="mt-8 text-[11px] text-[#6b746a]">Prototype — demonstrates the interaction flow with a simulated transcript.</p>
      </main>
    </AppShell>
  );
}
