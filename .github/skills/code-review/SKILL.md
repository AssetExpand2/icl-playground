---
name: code-review
description: Use when reviewing code changes or validating that changes meet icl-playground quality standards before committing. Covers TypeScript quality, React best practices, and icl-runtime integration correctness.
---

# Code Review

## When to Use

- Before committing changes
- Reviewing a batch of work
- User asks "does this look right?"

## Checklist

1. **TypeScript** — No `any` types, strict mode passes
2. **Components** — Functional only, proper props interfaces
3. **ICL Wrapper** — All `icl-runtime` calls go through `src/icl/runtime.ts`
4. **Error handling** — WASM calls wrapped in try/catch, errors shown in UI
5. **Styling** — Tailwind utilities only, responsive
6. **Build** — `npm run build` passes
7. **Honesty** — No fake features, disabled buttons for unavailable functions

## Anti-Patterns

- Importing `icl-runtime` directly in components (use the wrapper)
- Swallowing errors silently
- Using `any` to avoid type issues
- Inline styles instead of Tailwind
- Giant components (split into smaller ones)
