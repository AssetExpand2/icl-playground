---
name: brainstorming
description: Use when planning new features, exploring design decisions, or thinking through an approach before implementing. Helps evaluate trade-offs for UI/UX and architecture decisions in icl-playground.
---

# Brainstorming

## When to Use

- Before starting a new feature or phase
- Choosing between UI approaches or libraries
- Architecture decisions that affect multiple components
- User says "let's think about...", "how should we...", "what's the best way to..."

## Procedure

1. **Define the problem** — What exactly are we deciding?
2. **List constraints** — What does PLAN.md commit to? What does `icl-runtime` support?
3. **Generate options** — At least 2-3 approaches
4. **Evaluate trade-offs** — Bundle size, complexity, UX quality, maintenance burden
5. **Recommend** — Pick one and explain why
6. **Get user confirmation** — Present before implementing

## Rules

- **`icl-runtime` API is a hard constraint** — can only use what the npm package exposes
- **Client-side only** — no option that requires a server
- **PLAN.md decisions are soft constraints** — can be revisited but not silently ignored
- **Don't over-design** — solve today's problem
