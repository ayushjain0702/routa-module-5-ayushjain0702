// Lists, in plain words, every setting that differs from Routa's security baseline. Read-only: it changes nothing and shows no change.
import { readFileSync } from "node:fs";
import { getSettings } from "../platform.ts";
import type { Settings } from "../platform.ts";
import { requireToken } from "../token-check.ts";

export type Baseline = {
  owner?: string;
  agreed?: string;
  access: Record<string, string[]>;
  policies: Record<string, boolean | number | string>;
};

const baselineFile = new URL("../../../client/security-baseline.json", import.meta.url);

export function readBaseline(): Baseline {
  try {
    return JSON.parse(readFileSync(baselineFile, "utf8")) as Baseline;
  } catch (err) {
    throw new Error(`Could not read the security baseline in client/security-baseline.json: ${(err as Error).message}. Check that the file is there and is valid JSON. Nothing was changed.`);
  }
}

function inWords(value: unknown): string {
  if (value === true) return "on";
  if (value === false) return "off";
  return JSON.stringify(value);
}

const appList = (apps: string[]) => (apps.length ? apps.join(", ") : "no applications");

function accessDifferences(settings: Settings, baseline: Baseline): string[] {
  const found: string[] = [];
  for (const { group, apps } of settings.access) {
    const allowed = baseline.access[group];
    if (!allowed) {
      found.push(`${group} is on the platform but not in the baseline. It reaches ${appList(apps)}.`);
      continue;
    }
    for (const app of apps) if (!allowed.includes(app)) found.push(`${group} reaches ${app}, but the baseline says it shouldn't.`);
    for (const app of allowed) if (!apps.includes(app)) found.push(`${group} doesn't reach ${app}, but the baseline says it should.`);
  }
  for (const [group, allowed] of Object.entries(baseline.access)) {
    if (!settings.access.some((a) => a.group === group)) found.push(`${group} is in the baseline, which says it should reach ${appList(allowed)}, but there is no such group on the platform.`);
  }
  return found;
}

function policyDifferences(settings: Settings, baseline: Baseline): string[] {
  const found: string[] = [];
  for (const { id, label, value } of settings.policies) {
    const name = label ? `${label} (${id})` : id;
    if (!(id in baseline.policies)) found.push(`${name} is ${inWords(value)}, and the baseline doesn't mention it.`);
    else if (baseline.policies[id] !== value) found.push(`${name} is ${inWords(value)}, but the baseline says ${inWords(baseline.policies[id])}.`);
  }
  for (const [id, value] of Object.entries(baseline.policies)) {
    if (!settings.policies.some((p) => p.id === id)) found.push(`${id} is in the baseline, which says ${inWords(value)}, but there is no such policy on the platform.`);
  }
  return found;
}

export function differences(settings: Settings, baseline: Baseline): string[] {
  return [...accessDifferences(settings, baseline), ...policyDifferences(settings, baseline)];
}

export const compareToBaselineTool = {
  name: "compare_to_baseline",
  description: "List, in plain words, every setting that differs from Routa's security baseline (client/security-baseline.json). Read-only: works with a read-only token and changes nothing.",
  inputSchema: { type: "object", properties: {} },
  async handler() {
    await requireToken();
    const baseline = readBaseline();
    const found = differences(await getSettings(), baseline);
    const agreed = [baseline.agreed && `agreed on ${baseline.agreed}`, baseline.owner && `by ${baseline.owner}`].filter(Boolean).join(" ");
    const which = `the security baseline${agreed ? ` (${agreed})` : ""}`;
    if (found.length === 0) return `Every setting matches ${which}. Nothing was changed.`;
    const count = `${found.length} setting${found.length === 1 ? " differs" : "s differ"}`;
    return [`${count} from ${which}:`, ...found.map((line) => `- ${line}`), "Nothing was changed."].join("\n");
  },
};
