<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template principle slot 1 -> I. Code Quality Is Enforced
- Template principle slot 2 -> II. Tests Define Done
- Template principle slot 3 -> III. User Experience Must Stay Consistent
- Template principle slot 4 -> IV. Performance Budgets Are Mandatory
Added sections:
- Quality Gates
- Delivery Workflow
Removed sections:
- Placeholder fifth core principle slot from the base template
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .github/copilot-instructions.md
Follow-up TODOs:
- None
-->
# Learnt-spec-kit Constitution

## Core Principles

### I. Code Quality Is Enforced
All production changes MUST be readable, reviewable, and maintainable. Every
change MUST pass repository formatting, linting, and static analysis checks
relevant to the modified files before merge. Teams MUST prefer simple designs,
remove dead code introduced by refactors, and document non-obvious decisions in
the spec, plan, or code comments close to the change. Rationale: code quality
is the foundation that keeps future specification-driven work safe and fast.

### II. Tests Define Done
Every behavior change MUST include automated tests aligned to the risk of the
change, and those tests MUST fail before the implementation that satisfies them
is accepted. Unit tests MUST cover isolated logic, integration or contract
tests MUST cover cross-boundary behavior, and regressions MUST receive a test
that prevents recurrence. Manual testing MAY supplement automation, but it MUST
not replace automated coverage for shipped behavior. Rationale: a feature is
not complete until its correctness is repeatable and verifiable.

### III. User Experience Must Stay Consistent
User-facing changes MUST reuse established interaction patterns, terminology,
states, and accessibility expectations unless the spec and plan explicitly
justify a new pattern. Specifications MUST define acceptance scenarios for
success, empty, loading, and error states when a user can encounter them.
Reviews MUST reject changes that create avoidable inconsistency across labels,
navigation, content tone, or feedback behavior. Rationale: a predictable user
experience reduces support cost and improves trust.

### IV. Performance Budgets Are Mandatory
Each feature MUST declare measurable performance expectations for its critical
user journeys before implementation begins. Plans and tasks MUST identify how
performance will be measured, which regressions are unacceptable, and what
mitigation exists if a change exceeds budget. No change may knowingly ship with
an unapproved regression in latency, throughput, rendering smoothness, startup
time, or resource use for the affected surface. Rationale: performance is a
product requirement, not a post-release cleanup item.

## Quality Gates

- Specs MUST capture functional requirements plus explicit quality,
  user-experience, and performance requirements for the affected behavior.
- Plans MUST pass a Constitution Check covering code quality controls, required
  tests, UX consistency references, and measurable performance budgets.
- Tasks MUST include work for automated tests, UX validation, and performance
  verification whenever the feature changes runtime behavior.
- Pull requests MUST provide evidence that relevant checks, tests, and
  measurements were completed or document an approved exception.

## Delivery Workflow

- Work MUST follow the repository's spec → plan → tasks → implement flow for
  feature changes that affect product behavior.
- Code review MUST verify constitutional compliance before approval, including
  test coverage, UX consistency, and performance evidence.
- Exceptions MUST be explicit, time-bounded, and recorded in the implementation
  plan's Complexity Tracking section with the reviewer-approved rationale.
- Documentation and operator guidance MUST be updated when a change alters
  developer workflow, user-facing behavior, or measurement expectations.

## Governance

This constitution supersedes conflicting local habits or undocumented workflow
preferences. Amendments MUST be made in the same change set as any required
updates to dependent templates and guidance files. Semantic versioning governs
constitution updates: MAJOR for incompatible governance changes or principle
removals, MINOR for new principles or materially expanded obligations, and
PATCH for clarifications that do not alter expected behavior. Every feature
specification, implementation plan, task list, and pull request review MUST
include a compliance check against this constitution. Runtime contributors MUST
consult `.github/copilot-instructions.md` and the active plan in addition to
this file when executing work.

**Version**: 1.0.0 | **Ratified**: 2026-05-24 | **Last Amended**: 2026-05-24
