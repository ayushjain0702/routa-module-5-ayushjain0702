// PreToolUse gate: nothing changes mcp/src/token-check.ts.
// Refuses file edits to it, and shell commands that write to it.
// A command that only mentions the file (git add, cat, grep) is fine.
import { resolve } from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
const NAME = "token-check.ts";

function isProtectedPath(p: unknown): boolean {
  if (typeof p !== "string" || p === "") return false;
  return resolve(p).endsWith("/" + PROTECTED);
}

// Does one simple command (no ; && || | separators) write to the file?
function segmentWrites(seg: string): boolean {
  if (!seg.includes(NAME)) return false;
  const target = String.raw`["']?[^\s;&|"']*token-check\.ts`;
  const patterns = [
    new RegExp(String.raw`\d*>>?\|?\s*${target}`), // > file, >> file, 2> file
    new RegExp(String.raw`\btee\b[^\n]*token-check\.ts`),
    new RegExp(String.raw`\b(sed|perl|ruby)\b[^\n]*\s-[a-zA-Z]*i`), // in-place edit
    new RegExp(String.raw`\b(rm|unlink|truncate|shred|touch|chmod|chown)\b`),
    new RegExp(String.raw`\b(mv|cp|install|rsync|ln)\b`), // as source it is harmless, but we cannot tell
    new RegExp(String.raw`\bdd\b[^\n]*\bof=`),
    new RegExp(String.raw`\bgit\s+(checkout|restore|rm|mv|apply|stash|reset|clean)\b`),
    new RegExp(String.raw`\bpatch\b`),
    new RegExp(String.raw`(writeFile|appendFile|createWriteStream|open\s*\([^)]*["'][wa]|write_text|write_bytes)`),
  ];
  return patterns.some((re) => re.test(seg));
}

export function commandWritesProtected(command: string): boolean {
  if (!command.includes(NAME)) return false;
  return command.split(/&&|\|\||[;|\n]/).some(segmentWrites);
}

export function check(input: { tool_name?: string; tool_input?: Record<string, unknown> }): string | null {
  const tool = input.tool_name ?? "";
  const args = input.tool_input ?? {};
  if (tool === "Bash") {
    if (commandWritesProtected(String(args.command ?? ""))) return `a shell command that writes to ${PROTECTED}`;
    return null;
  }
  if (isProtectedPath(args.file_path) || isProtectedPath(args.notebook_path) || isProtectedPath(args.path)) {
    return `an edit to ${PROTECTED}`;
  }
  return null;
}

if (import.meta.main) {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let input = {};
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const reason = check(input);
  if (reason) {
    process.stderr.write(`Blocked: ${reason}. This file is protected and is not changed by Claude.\n`);
    process.exit(2);
  }
}
