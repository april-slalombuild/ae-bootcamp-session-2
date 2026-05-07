# Coding Guidelines

This document captures the coding style and quality principles for the TODO app. It is intentionally written as a narrative — not a checklist — because good code comes from shared judgment, not rigid rules.

## Readability First

Code is read far more often than it is written. We optimize for the next person who has to understand a file (often a future version of ourselves). That means choosing clarity over cleverness, naming things for what they mean rather than what they do mechanically, and letting the structure of the code tell the story of what the program is trying to accomplish. If a reader has to pause and reconstruct intent from the syntax, the code can be improved.

We favor small, well-named functions and modules with a single, obvious responsibility. We avoid abbreviations except for ones that are universally understood in our domain, and we resist the temptation to compress logic into one-liners that look elegant but obscure intent.

## Consistency Across the Codebase

A reader moving between files should feel like they are still in the same project. We use the same patterns for similar problems: the same way of structuring a React component, the same way of organizing an Express route, the same way of handling errors and logging. When an established pattern exists in the codebase, we follow it. When we believe a better pattern has emerged, we update the existing code as well — we do not leave two competing styles side by side.

Naming, file layout, import order, and even the way we phrase comments and commit messages should feel uniform. Surprise is a cost.

## Predictable, Easy-to-Find Dependencies

Dependencies — both external packages and internal modules — should be easy to locate and reason about. Imports live at the top of the file, grouped by origin (standard library, external packages, internal modules) and ordered consistently. We avoid deep relative paths (`../../../..`) by leaning on the workspace structure and, where helpful, path aliases.

We are deliberate about adding new dependencies. Each package brings maintenance, security, and bundle-size cost. Before pulling in a library, we ask whether the standard library or a small in-house utility would do. When we do add a dependency, we prefer well-maintained, widely used packages and pin versions explicitly.

## Linting and Formatting

We rely on **ESLint** for static analysis and **Prettier** for formatting. These tools are not suggestions: they run automatically and their output is the source of truth for style debates. By outsourcing formatting to a tool, we free ourselves to focus on substance during code review.

The lint and format commands are part of the standard development loop and are enforced in CI. Disabling a rule is allowed only with a brief inline comment explaining why; we do not silence whole files or directories without justification.

## DRY, KISS, and YAGNI

These three principles guide our day-to-day decisions, but we apply them with judgment rather than dogma.

**DRY (Don't Repeat Yourself)** reminds us to extract repeated logic when the duplication represents the *same idea*. Two pieces of code that look similar today but model different concepts should usually be left alone — premature deduplication couples them in ways that hurt later. We refactor toward DRY when the third occurrence appears, not the second.

**KISS (Keep It Simple, Stupid)** pushes us toward the simplest solution that solves the problem in front of us. We prefer straightforward control flow, plain data structures, and explicit code over clever abstractions. Complexity should be earned by a real requirement, not anticipated.

**YAGNI (You Aren't Gonna Need It)** stops us from building for imagined futures. We do not add configuration options, abstraction layers, or extension points "just in case." When the future need arrives, we will be in a better position to design for it than we are today.

## Code That Flows Naturally

Good code has a rhythm. Functions read top-to-bottom in the order their steps execute. Variables are declared close to where they are used. Conditional branches are arranged so the happy path is the visually dominant one, and early returns handle edge cases up front rather than nesting them deeply. A reader should be able to skim a function and follow what it does without jumping around.

We prefer composing small functions over long ones with internal section comments. If a function needs a comment to mark its phases, those phases probably want to be functions of their own.

## Comments and Documentation

Comments explain **why**, not **what**. The code itself should make the *what* obvious; comments are reserved for context that the code cannot express — a non-obvious constraint, a link to a ticket or spec, or a warning about a subtle interaction. We delete stale comments aggressively; an out-of-date comment is worse than no comment at all.

Public APIs, exported functions, and configuration files deserve concise documentation. Internal helpers usually do not.

## Error Handling

We handle errors at the boundaries of the system — at HTTP handlers, at I/O calls, at user input — and let the inner code assume valid inputs. We never swallow errors silently. Every caught error is either logged with enough context to diagnose it later, surfaced to the user in an actionable way, or both. We avoid generic `try/catch` blocks that obscure the source of failure.

## Testing as Part of the Code

Tests are first-class code and follow the same quality bar as the application itself. We write them as we go, not as an afterthought. The standards for naming, structure, and clarity apply to test files just as much as to production files. See the [Testing Guidelines](./testing-guidelines.md) for the project's testing conventions.

## Reviewing Our Own Work

Before opening a pull request, we read our own diff as if we were a reviewer seeing it for the first time. We look for code that surprised us, comments that no longer match the code, dead branches, and opportunities to simplify. The best time to catch a problem is before anyone else has to.

## When in Doubt

When two approaches seem equally reasonable, we choose the one that is easier to delete. Code that is easy to remove is also easy to change, and changeable code is the foundation of a healthy codebase.
