---
name: Preview registration quirk
description: A workspace-specific issue affecting artifact and workflow registration after conversation handoff.
---

Artifact and workflow registration may fail with an `rg` error for `.conversation/.agents` when the session metadata mount is present but incomplete. The frontend can still be implemented and built locally, but preview registration may remain unavailable until the platform repairs or remounts that metadata directory.

**Why:** The imported project hit this failure during both artifact creation and workflow configuration, while dependency installation, typechecking, and Vite production build succeeded.

**How to apply:** If this exact `rg` error appears, do not repeatedly redesign or recreate the app. Verify the code with direct typecheck/build commands, then retry registration only after the session metadata mount is healthy.