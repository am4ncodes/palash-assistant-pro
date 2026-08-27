import { storagePut } from "./storage";

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

export async function synthesizeSpeech(input: { text: string; language: string; voiceId?: string }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("Cloud speech is not configured");
  const voiceId = input.voiceId || DEFAULT_VOICE_ID;
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: input.text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!response.ok) throw new Error(`Cloud speech provider returned ${response.status}`);
  const audio = Buffer.from(await response.arrayBuffer());
  return storagePut(`audio/${Date.now()}-${voiceId}.mp3`, audio, "audio/mpeg");
}
