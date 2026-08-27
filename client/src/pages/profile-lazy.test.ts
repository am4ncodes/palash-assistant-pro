import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Profile chart code splitting", () => {
  it("keeps heavy chart code behind a lazy boundary with a fallback", () => {
    const source = readFileSync(new URL("./ProfilePage.tsx", import.meta.url), "utf8");
    expect(source).toContain('lazy(() => import("@/components/ProfileCharts"))');
    expect(source).toContain("<Suspense fallback={<ChartsFallback />}");
    expect(source).not.toContain('from "recharts"');
  });
});
