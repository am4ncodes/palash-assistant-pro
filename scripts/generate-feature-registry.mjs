import fs from "node:fs";

const file = "client/src/data/featureRegistry.ts";
const source = fs.readFileSync(file, "utf8");
const marker = "\n];";
const insertAt = source.lastIndexOf(marker);
if (insertAt < 0) throw new Error("Feature registry closing marker not found");

const additions = {
  Language: ["Context presets", "Formal classroom tone", "Local idiom hints", "Translation glossary", "Batch phrase translation", "Language direction lock", "Source text cleanup", "Teacher review mode"],
  Audio: ["Cloud voice preview", "Voice pronunciation guide", "Audio batch export", "Playback loop", "Offline audio shelf", "Audio waveform view", "Teacher recording notes", "Pronunciation feedback"],
  Classroom: ["Classroom roster", "Assignment planner", "Practice calendar", "Lesson timer", "Warm-up cards", "Exit ticket prompts", "Student group sets", "Lesson duplication", "Classroom goals", "Teaching reflection"],
  Library: ["Document bookmarks", "Page-level notes", "OCR confidence", "Document language filter", "Recent documents", "Shared resource links", "Archive shelf", "Library collections"],
  Community: ["Contribution editor", "Review feedback", "Phrase provenance", "Community guidelines", "Contributor drafts", "Language steward queue", "Suggested improvements", "Community activity"],
  Operations: ["System status", "Request trace viewer", "Quota dashboard", "Storage alerts", "Model routing", "Retry policy controls", "Incident notes", "Release channels"],
  Accessibility: ["Keyboard command guide", "Screen reader landmarks", "High contrast mode", "Reduced motion mode", "Large type mode", "Focus recovery", "Accessible audio labels", "Form error summaries"],
  Insights: ["Weekly practice trend", "Phrase retention", "Most used intent", "Lesson completion rate", "Library usage trend", "Audio practice minutes", "Community contribution trend", "Teacher impact snapshot", "Progress comparison", "Exportable insights"],
};

const accentByGroup = { Language: "orange", Audio: "blue", Classroom: "green", Library: "blue", Community: "orange", Operations: "green", Accessibility: "blue", Insights: "orange" };
const extra = [];
for (const [group, titles] of Object.entries(additions)) {
  titles.forEach((title, index) => {
    const id = `${group.toLowerCase()}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    const status = index % 4 === 0 ? "Live" : index % 2 === 0 ? "Beta" : "Planned";
    extra.push(`  { id: "${id}", group: "${group}", title: "${title}", description: "A professional ${title.toLowerCase()} workflow for field-ready teaching teams.", status: "${status}", accent: "${accentByGroup[group]}" },`);
  });
}

const next = source.slice(0, insertAt) + "\n" + extra.join("\n") + source.slice(insertAt);
fs.writeFileSync(file, next);
console.log(`Added ${extra.length} modules; registry now contains ${[...next.matchAll(/\{ id:/g)].length} features.`);
