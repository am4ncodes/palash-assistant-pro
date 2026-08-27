import { describe, expect, it } from "vitest";

describe("cloud TTS provider configuration", () => {
  it("accepts the configured ElevenLabs credential", async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    expect(apiKey, "ELEVENLABS_API_KEY must be configured").toBeTruthy();
    const response = await fetch("https://api.elevenlabs.io/v1/user", { headers: { "xi-api-key": apiKey! } });
    expect(response.ok, `ElevenLabs returned ${response.status}`).toBe(true);
  }, 15_000);
});
