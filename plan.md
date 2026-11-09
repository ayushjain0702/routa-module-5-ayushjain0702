# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] set_session_length only shows the change; apply_change applies it (the lint found it applying unseen)
- [x] copy_group_access only shows the change and needs an admin token (verify's security judge: two high findings)
- [x] The settings-shape test skips when the recorded settings aren't there, so CI passes on a clean checkout
- [x] compare_to_baseline: IT asked for a read-only list, in plain words, of every setting that differs from client/security-baseline.json. Any valid token works, and it changes nothing (no PATCH, no preview). It always reads the fixed baseline file and takes no arguments. A group or policy that is on only one side counts as a difference.
- [x] preview_change checks each change and keeps only the fields it shows, so what is applied is exactly what was shown (verify's security judge: one high finding)
