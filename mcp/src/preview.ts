// Shows a change in plain words and keeps it under an id, so what is applied is what was shown.
import { randomUUID } from "node:crypto";
import type { Change, Settings } from "./platform.ts";

const shown = new Map<string, Change[]>();

function inWords(change: Change, settings: Settings): string {
  if (change.type === "access") return `${change.group} ${change.allowed ? "gains" : "loses"} ${change.app}`;
  const policy = settings.policies.find((p) => p.id === change.id);
  return `${change.id} goes from ${JSON.stringify(policy?.value)} to ${JSON.stringify(change.value)}`;
}

const wrongShape =
  'Each change must be {"type":"access","group":"<group>","app":"<app>","allowed":true or false} or {"type":"policy","id":"<policy>","value":<true, false, a number or a string>}. Nothing was changed.';

// Checks one change and rebuilds it from only the fields that are shown, so nothing unseen reaches the platform.
function checked(raw: unknown): Change {
  const c = (raw ?? {}) as Record<string, unknown>;
  if (c.type === "access" && typeof c.group === "string" && typeof c.app === "string" && typeof c.allowed === "boolean") {
    return { type: "access", group: c.group, app: c.app, allowed: c.allowed };
  }
  const v = c.value;
  if (c.type === "policy" && typeof c.id === "string" && (typeof v === "boolean" || typeof v === "number" || typeof v === "string")) {
    return { type: "policy", id: c.id, value: v };
  }
  throw new Error(`This change isn't one I can show: ${JSON.stringify(raw)}. ${wrongShape}`);
}

export function showChange(input: unknown, settings: Settings): string {
  if (!Array.isArray(input)) throw new Error(`Give the changes as a list. ${wrongShape}`);
  const changes = input.map(checked);
  const id = randomUUID();
  shown.set(id, changes);
  return [`Change ${id} would do this:`, ...changes.map((c) => `- ${inWords(c, settings)}`), "Nothing has changed yet. Apply it with apply_change and this id."].join("\n");
}

export function takeChange(id: string): Change[] {
  const changes = shown.get(id);
  if (!changes) throw new Error(`No change has been shown with id ${id}. Preview it first.`);
  shown.delete(id);
  return changes;
}
