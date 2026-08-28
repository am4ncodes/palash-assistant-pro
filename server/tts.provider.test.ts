import { describe, expect, it } from "vitest";

  const apiKey = process.env.ELEVENLABS_API_KEY;
  describe("cloud TTS provider configuration", () => {
  it.skipIf(!apiKey)("accepts the configured ElevenLabs credential", async () => {
      const response = await fetch(...);
  }, 15_000);
});
