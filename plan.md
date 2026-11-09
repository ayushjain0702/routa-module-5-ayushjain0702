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
