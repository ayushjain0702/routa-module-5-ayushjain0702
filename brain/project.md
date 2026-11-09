# Project brain

## What this is

Routa's IT configures its identity platform by asking Claude, through this MCP server. The brief is in `client/brief.md`.

## What we found out

- The admin API applies a PATCH at once and has no preview, so the server keeps its own.
- The API doesn't enforce scope: any valid token can PATCH. `whoami` says what a token is, and the server must refuse.
- `session-length-hours` takes a number, `guest-access` a string, and the `mfa.*` policies true or false.
- `client/security-baseline.json` maps each group to the applications it may reach, and each policy id to its value. A read-only token can read everything needed to compare it with the platform. On 2026-11-09 the test environment differed from it in 9 places (4 access, 5 policy).
- The existing `npm run baseline:check` script only checks groups and policies that are on the platform. Ones that are only in the baseline get missed.

## Rules that cost us if we break them

- A read-only token never changes a setting.
- Every change is shown before it is applied, and what is applied is what was shown.
