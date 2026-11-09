// Every change is shown before it is applied: a tool in mcp/src/tools,
// other than apply-change.ts, that calls patchSettings must also call showChange.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "mcp/src/tools";
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const calls = (s: string, name: string) => new RegExp(String.raw`\b${name}\s*\(`).test(s);

const failures: string[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "apply-change.ts").sort()) {
  const src = stripComments(readFileSync(join(dir, file), "utf8"));
  if (calls(src, "patchSettings") && !calls(src, "showChange")) {
    failures.push(`${join(dir, file)}: calls patchSettings without calling showChange`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("lint: ok");
