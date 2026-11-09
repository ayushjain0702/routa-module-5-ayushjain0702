import assert from "node:assert/strict";
import { test } from "node:test";
import type { Settings } from "../src/platform.ts";
import { compareToBaselineTool, differences } from "../src/tools/compare-to-baseline.ts";
import type { Baseline } from "../src/tools/compare-to-baseline.ts";
import { fakePlatform } from "./fake-platform.ts";

const settings: Settings = {
  access: [
    { group: "contractors", apps: ["timesheets", "finance"] },
    { group: "staff", apps: ["documents"] },
    { group: "visitors", apps: [] },
  ],
  policies: [
    { id: "mfa.contractors", label: "Require MFA for contractors", value: false },
    { id: "session-length-hours", label: "Session length in hours", value: 24 },
    { id: "guest-access", label: "Guest access", value: "invite-only" },
    { id: "new-policy", label: "Something new", value: 3 },
  ],
};
const baseline: Baseline = {
  access: { contractors: ["timesheets"], staff: ["documents", "timesheets"], partners: ["crm"] },
  policies: { "mfa.contractors": true, "session-length-hours": 8, "guest-access": "invite-only", "legacy-sign-in": false },
};

test("differences lists every setting that differs, both ways, in plain words", () => {
  assert.deepEqual(differences(settings, baseline), [
    "contractors reaches finance, but the baseline says it shouldn't.",
    "staff doesn't reach timesheets, but the baseline says it should.",
    "visitors is on the platform but not in the baseline. It reaches no applications.",
    "partners is in the baseline, which says it should reach crm, but there is no such group on the platform.",
    "Require MFA for contractors (mfa.contractors) is off, but the baseline says on.",
    "Session length in hours (session-length-hours) is 24, but the baseline says 8.",
    "Something new (new-policy) is 3, and the baseline doesn't mention it.",
    "legacy-sign-in is in the baseline, which says off, but there is no such policy on the platform.",
  ]);
});

test("differences is empty when the settings match", () => {
  const matching: Baseline = {
    access: { contractors: ["timesheets", "finance"], staff: ["documents"], visitors: [] },
    policies: { "mfa.contractors": false, "session-length-hours": 24, "guest-access": "invite-only", "new-policy": 3 },
  };
  assert.deepEqual(differences(settings, matching), []);
});

test("compare_to_baseline works with a read-only token and changes nothing", async () => {
  const { patches } = fakePlatform("read");
  const methods: string[] = [];
  const fake = globalThis.fetch;
  globalThis.fetch = ((input: string, init?: RequestInit) => {
    methods.push(init?.method ?? "GET");
    return fake(input, init);
  }) as typeof fetch;
  const text = await compareToBaselineTool.handler();
  assert.match(text, /differ from the security baseline/);
  assert.match(text, /contractors is on the platform but not in the baseline/);
  assert.match(text, /Nothing was changed\.$/);
  assert.equal(patches.length, 0);
  assert.ok(methods.every((m) => m === "GET"));
});

test("compare_to_baseline refuses when the token isn't valid", async () => {
  globalThis.fetch = (async () => Response.json({ status: 401, detail: "invalid token" }, { status: 401 })) as unknown as typeof fetch;
  await assert.rejects(compareToBaselineTool.handler(), /401/);
});
