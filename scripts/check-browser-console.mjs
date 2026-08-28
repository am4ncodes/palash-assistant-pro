import fs from "node:fs";

const logPath = process.env.BROWSER_CONSOLE_LOG || ".manus-logs/browserConsole.log";
const since = process.env.BROWSER_LOG_SINCE ? Date.parse(process.env.BROWSER_LOG_SINCE) : 0;
const patterns = [/failed to connect to websocket/i, /localhost:5173/i, /\[API Query Error\]/i, /\[API Mutation Error\]/i];
if (!fs.existsSync(logPath)) { console.log(`[browser-console] no log found at ${logPath}; nothing to scan`); process.exit(0); }
const failures = fs.readFileSync(logPath, "utf8").split("\n").filter((line) => {
  const stamp = Date.parse(line.match(/^\[([^\]]+)\]/)?.[1] ?? "");
  return (!since || !Number.isNaN(stamp) && stamp >= since) && patterns.some((pattern) => pattern.test(line));
});
if (failures.length) {
  console.error("[browser-console] regression signatures detected:");
  console.error(failures.slice(-20).join("\n"));
  process.exit(1);
}
console.log("[browser-console] no websocket or API regression signatures found");
