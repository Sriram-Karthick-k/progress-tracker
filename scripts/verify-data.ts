// Data integrity check for the DSA content. Run: npx tsx scripts/verify-data.ts
import { PROBLEMS, PATTERN_ORDER, PATTERN_CUE, TOPICS, ROUNDS, topicsForRound } from "../lib/seed-data";

let failures = 0;
const fail = (msg: string) => {
  console.error("  FAIL: " + msg);
  failures++;
};

// 1. no duplicate LeetCode numbers
const byLc = new Map<number, string[]>();
PROBLEMS.forEach((p) => byLc.set(p.lcNumber, [...(byLc.get(p.lcNumber) ?? []), p.title]));
[...byLc.entries()].filter(([, v]) => v.length > 1).forEach(([lc, v]) => fail(`duplicate LC ${lc}: ${v.join(" | ")}`));

// 2. no duplicate ids
const ids = new Set<string>();
PROBLEMS.forEach((p) => {
  if (ids.has(p.id)) fail(`duplicate id ${p.id}`);
  ids.add(p.id);
});

// 3. no duplicate titles
const titles = new Map<string, number[]>();
PROBLEMS.forEach((p) => titles.set(p.title.toLowerCase(), [...(titles.get(p.title.toLowerCase()) ?? []), p.lcNumber]));
[...titles.entries()].filter(([, v]) => v.length > 1).forEach(([t, v]) => fail(`duplicate title "${t}" -> LC ${v.join(",")}`));

// 4. every pattern is known + has a cue
PROBLEMS.forEach((p) => {
  if (!PATTERN_ORDER.includes(p.pattern)) fail(`LC ${p.lcNumber} has unknown pattern "${p.pattern}"`);
  p.also.forEach((a) => {
    if (!PATTERN_ORDER.includes(a)) fail(`LC ${p.lcNumber} 'also' unknown pattern "${a}"`);
    if (a === p.pattern) fail(`LC ${p.lcNumber} lists its own pattern in 'also'`);
  });
});
PATTERN_ORDER.forEach((p) => {
  if (!PATTERN_CUE[p]) fail(`pattern "${p}" has no cue`);
  if (!PROBLEMS.some((x) => x.pattern === p)) fail(`pattern "${p}" has no problems`);
});

// 5. required fields
PROBLEMS.forEach((p) => {
  if (!["Easy", "Medium", "Hard"].includes(p.difficulty)) fail(`LC ${p.lcNumber} bad difficulty "${p.difficulty}"`);
  if (!p.url.startsWith("https://leetcode.com/problems/")) fail(`LC ${p.lcNumber} bad url ${p.url}`);
  if (!p.group) fail(`LC ${p.lcNumber} missing group`);
  if (!p.mechanic) fail(`LC ${p.lcNumber} missing mechanic`);
});

// 6. every DSA pattern is a real category in the DSA round
const dsaCats = new Set(topicsForRound("dsa").map((t) => t.category));
PATTERN_ORDER.forEach((p) => {
  if (!dsaCats.has(p)) fail(`pattern "${p}" is not a DSA round category`);
});

// 7. topic ids unique
const tids = new Set<string>();
TOPICS.forEach((t) => {
  if (tids.has(t.id)) fail(`duplicate topic id ${t.id}`);
  tids.add(t.id);
});

// ---- report ----
const diff: Record<string, number> = {};
PROBLEMS.forEach((p) => (diff[p.difficulty] = (diff[p.difficulty] ?? 0) + 1));

console.log(`Problems        : ${PROBLEMS.length} (unique LC: ${byLc.size})`);
console.log(`Patterns        : ${PATTERN_ORDER.length}`);
console.log(`Cross-listed    : ${PROBLEMS.filter((p) => p.also.length).length}`);
console.log(`With companies  : ${PROBLEMS.filter((p) => p.companies).length}`);
console.log(`Difficulty      : ${JSON.stringify(diff)}`);
console.log(`Rounds          : ${ROUNDS.length}`);
console.log(`Topics          : ${TOPICS.length}  (DSA: ${topicsForRound("dsa").length})`);
console.log(`DSA categories  : ${dsaCats.size}`);
console.log(failures === 0 ? "\nAll checks PASSED ✅" : `\n${failures} CHECK(S) FAILED ❌`);
process.exit(failures === 0 ? 0 : 1);
