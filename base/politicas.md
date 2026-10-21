# Canonical durable policies

## Authority and scope

Follow applicable host instructions and the user's explicit task. This base is adopted in new projects; reference repositories are read-only evidence. Project-specific exceptions must name their scope and reason. A task does not silently update this shared standard. Evolve the base through a separate, reviewable local version change.

Use [regras.json](regras.json) for stable rule identifiers, sources, scopes and verification methods. Distinguish explicit requirements, recurring observations, required ecosystem conventions, project-specific decisions and new proposals. Do not turn Java, Spring, microservices, messaging or a design pattern into a universal architecture. Do not copy a defect to imitate a reference.

## Manual Git and GitHub

Never execute Git commands automatically, including status, diff and log. Do not initialize, clone, fetch, stage, commit, push, switch, merge, rebase, cherry-pick, tag, stash, reset, clean or manage branches/worktrees. Do not inspect or modify Git metadata as a substitute. Do not perform Git/GitHub operations through libraries, hooks, installers, other agents or native background/worktree features.

Do not create or change GitHub repositories, PRs, issues, releases, settings, permissions or remote workflows. Do not publish or deploy. A user authorization is limited to the specific operation requested; implement, fix, finish, update and coordinate are not Git/GitHub authorization. Read explicitly supplied public references using ordinary HTTP/source copies when relevant. Use ordinary filesystem snapshots and comparisons for this workflow.

Do not test this prohibition with a real forbidden operation. Use static inspection or harmless doubles. Report host enforcement limitations without claiming instructions alone guarantee prevention.

## Language

Write role/skill instructions, routing descriptions, canonical model policies, AGENTS.md and CLAUDE.md instructional prose in English. Write authored classes, types, methods, functions, variables, parameters, callbacks, components and custom internal schema fields in PT-BR. Comments, docstrings, test descriptions, human-facing logs, README/guides/ADR prose and responses to Pedro are also PT-BR. Portuguese identifiers may omit diacritics.

Preserve language syntax, imported APIs, inherited required signatures, mandatory framework conventions, native metadata keys, standard filenames, protocols, acronyms and compatible external contracts. Tie each non-obvious exception to the actual requirement. An optional English Service, Controller, Request, Response or Exception suffix is not justified merely because it is common. See [examples](exemplos.md). Do not mass-rename legacy code or break public contracts outside the task.

## Engineering and verification

Keep responsibilities focused, boundaries explicit, dependencies visible and control flow readable. Validate at relevant boundaries. Prevent invalid inputs from causing unintended effects. Define observable error behavior, authorization, consistency and retry semantics when they affect the task. Use abstraction only when it solves a demonstrated problem.

Implementers own appropriate initial checks. QA adds meaningful independent or expanded checks. Tests must expose plausible mistakes through outputs, boundary values, failures and effects or absence of effects. Do not mirror implementation details, impose arbitrary coverage quotas or describe mocks as proof of an actual integration. Inspect skipped tests and record why they did not execute.

Comments explain decisions, invariants, constraints or non-obvious behavior when naming and structure cannot. Do not narrate obvious operations or satisfy a comment quota. Documentation describes actual implementation, prerequisites, inputs, actions, effects and expected results. Keep the primary path in README and deeper procedures in linked guides. A meaningful ADR uses Contexto, Decisão and Consequências; further sections are proposals.

No personal frontend design system is established by the backend references. Reuse project components and approved visual examples. Present a new visual direction as a proposal. Check relevant rendered states, responsiveness, keyboard access and reduced motion.

## Ownership, transfer and recovery

Use one coordinator. Each task has a bounded objective, role, project/profile, standards version, base snapshot, writing scope, required resources, dependencies, acceptance criteria and operational limits. Pass prerequisite evidence explicitly. A review requires the exact implementation snapshot under review.

Use isolated ordinary directories or sequential writers. Copy only necessary files; exclude Git metadata, credentials and unrelated private content. Provide the standards inside isolated runs. Separate ports, test data and services for concurrent tests when needed. Never invoke native isolation that creates Git worktrees.

Before file integration, compare current target content to the recorded base. Reconcile compatible changes deliberately; report stale/conflicting files without silently overwriting them. Identify and verify the integrated snapshot. Record completed integrations so a resume cannot apply the same result twice. Bound retries/concurrency; preserve partial evidence and concrete next actions on interruption, unavailability or failure.

A result states completion status, role/executor, inspected/changed files, base/result identities, findings, checks actually executed, omitted checks with reasons and remaining dependencies. Missing output or valid JSON alone is not success. Separate static analysis, component tests, executor simulations and real tool/model/service calls. Never invent independent reviews or completed executions.

## Local lifecycle

Install from a known local version. Inspect target files, preserve personalizations and track managed files. Reinstallation is idempotent. Preview updates, detect local modifications and keep unrelated overrides. Pin versions per project and restore previous managed content through ordinary files. No installer, updater, diagnostic or remover may rely on Git or rewrite global settings silently.
