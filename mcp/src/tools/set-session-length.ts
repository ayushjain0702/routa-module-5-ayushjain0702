import { getSettings } from "../platform.ts";
import { showChange } from "../preview.ts";
import { requireAdmin } from "../token-check.ts";

export const setSessionLengthTool = {
  name: "set_session_length",
  description: "Show what setting the session length to this many hours would do. Nothing changes until apply_change is called with the id it returns.",
  inputSchema: { type: "object", properties: { hours: { type: "number" } }, required: ["hours"] },
  async handler({ hours }: { hours: number }) {
    await requireAdmin();
    return showChange([{ type: "policy", id: "session-length-hours", value: hours }], await getSettings());
  },
};
