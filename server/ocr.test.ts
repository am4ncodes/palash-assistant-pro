import { describe, expect, it } from "vitest";
import { shouldUseOcr } from "./ocr";

describe("shouldUseOcr", () => {
  it("uses OCR for blank or sparse text layers", () => {
    expect(shouldUseOcr("")).toBe(true);
    expect(shouldUseOcr("12 words only")).toBe(true);
    expect(shouldUseOcr(null)).toBe(true);
  });

  it("keeps a healthy text layer on the fast path", () => {
    expect(shouldUseOcr("This document has enough extracted text to preview without OCR fallback.")).toBe(false);
  });
});
