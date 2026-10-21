---
name: integration-testing
description: Exercise real database, messaging, HTTP, filesystem, or service boundaries when integration risk is material.
---

# Integration testing

Use the real dependency or an honest boundary substitute. Confirm serialization, persistence, status, and side effects. Report unavailable containers or services; a green build may have skipped integration tests. A mock proving that a collaborator was called is unit evidence, not real integration.
