---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent reads the server against a file of criteria. Fails if any finding is high or critical. See below.

## The security judge

The criteria file is an input. It is `client/security-criteria.md` unless the user names another file, so a different set of criteria can be swapped in. Say which file was used when you report.

Start the judge with the Agent tool as a fresh agent (`subagent_type: "general-purpose"`, never a fork). It must not have built the server and must not inherit this conversation, so don't tell it what was built, what you expect, or what you think the answer is. Give it only this brief, with `<criteria>` replaced by the file's path:

> You are a security judge. You did not build this server and you have no context about it. Read the MCP server in `mcp/src/` (every file, including `mcp/src/tools/`) against the criteria in `<criteria>`. Read the criteria first, then the code, whole files, not excerpts. Do not read token files, `.env*` or `~/.routa`, and do not change anything: you only read.
>
> For each way the code breaks a criterion, report a finding:
> - **Rating:** low, medium, high or critical, taken from where the criteria put that kind of problem. If the criteria don't say, use your judgment and say so.
> - **Rule:** the criterion it breaks, in the criteria's own words.
> - **Where:** `file:line`, with the line quoted exactly as it is in the file.
> - **Why:** one or two sentences on how it happens.
>
> Only report what you saw in the code, with a quoted line. Don't pad, and don't report a rule the code meets. End with one line: `Highest: <rating>` or `Highest: none`.

Then, in the report:

- List the findings from the judge, most severe first, with their rating, file and line. Check that each has a quoted line that really is in the file; drop any that doesn't, and say you did.
- **The check fails if any finding is high or critical.** Low and medium are listed and don't fail it.
- If the judge reports nothing, say so plainly. Don't add findings of your own, and don't argue a rating down.
