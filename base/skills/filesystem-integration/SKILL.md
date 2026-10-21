---
name: filesystem-integration
description: Integrate isolated file results without Git while preserving concurrent user work; use for snapshots, result transfer, conflict detection, and recovery.
---

# filesystem-integration

Hash the bounded source files before delegation. Require every returned file to identify its base hash. Before writing, compare the destination again. Stop on stale files; reconcile deliberately. Verify the combined state and record integrated identifiers to prevent duplicate application.

Apply the canonical no-Git policy and language policy. Return evidence, performed checks, unperformed checks with reasons, and blockers. Do not expand authorization or claim execution that did not occur.

