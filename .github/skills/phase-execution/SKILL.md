---
name: phase-execution
description: Use when starting, executing, or completing any ROADMAP.md phase or sub-phase for icl-playground. Enforces the repeating workflow — implement in batches, build check, update ROADMAP checkboxes, git commit and push. Triggers on phrases like "start phase", "continue phase", "proceed", "begin 1.3", or any reference to executing a ROADMAP item.
---

# Phase Execution

Rigid workflow for executing any ROADMAP.md phase. Follow exactly.

## Before Starting

1. Read the phase items from `ROADMAP.md`
2. Read `PLAN.md` for architecture context
3. Read existing code that the phase builds on
4. Present a brief plan to the user — what will be built, in how many batches

## Directory Rule (CRITICAL)

**Every terminal command MUST be prefixed with `cd /home/opeworld/Documents/RobustBrains/icl-playground &&`.**
Background terminals start at the workspace root (`/home/opeworld/Documents/RobustBrains/`), NOT in the project directory. Running bare `npm run dev` or `npm run build` will fail with ENOENT.

Correct: `cd /home/opeworld/Documents/RobustBrains/icl-playground && npm run build 2>&1`
Wrong: `npm run build 2>&1`

## Implementation Loop

For each batch:

1. **Announce** — Tell user what this batch covers
2. **Implement** — Write the code
3. **Build** — `cd /home/opeworld/Documents/RobustBrains/icl-playground && npm run build` (must pass — no TypeScript errors)
4. **Dev check** — `cd /home/opeworld/Documents/RobustBrains/icl-playground && npm run dev` starts without errors
5. **Report** — Show results, ask user to type "continue" for next batch

## After All Batches Complete

1. **Full build** — `npm run build`
2. **Update ROADMAP.md** — Check off all completed items with `[x]`
3. **Git commit & push** — ALWAYS `cd` into the repo directory first:
   ```bash
   cd /home/opeworld/Documents/RobustBrains/icl-playground
   git add -A && git commit -m "feat(scope): Phase X.Y — description"
   git push
   ```
4. **Report** — Confirm phase complete, state what's next

## Rules

- **Never skip ROADMAP update** — it's the single source of truth
- **Never skip git commit+push** — every sub-phase gets committed
- **Build before commit** — always `npm run build` before committing
- **Batch size** — user controls when to continue; don't auto-proceed
- **Honesty** — only mark features as working if they actually work in the browser
