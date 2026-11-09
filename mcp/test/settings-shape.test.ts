// Checks our settings against a copy of what the platform returned when we built this.
// The copy is recorded on a developer's machine and is not in the repository, so the test skips where it is missing, such as in CI.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const recordedFile = new URL("./fixtures/local-settings.json", import.meta.url);
const missing = existsSync(recordedFile) ? false : "no recorded settings in mcp/test/fixtures/local-settings.json (it is kept out of the repository)";

test("the recorded settings have the shape the tools expect", { skip: missing }, () => {
  const recorded = JSON.parse(readFileSync(recordedFile, "utf8"));
  assert.ok(Array.isArray(recorded.access));
  assert.ok(recorded.access.every((a: { group: string; apps: string[] }) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(recorded.policies.every((p: { id: string }) => typeof p.id === "string"));
});
