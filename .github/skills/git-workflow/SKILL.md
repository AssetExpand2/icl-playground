---
name: git-workflow
description: Use when committing, branching, creating PRs, or managing Git operations for icl-playground. Covers commit message format and push workflow.
---

# Git Workflow

## When to Use

- Making a commit
- Pushing to remote
- Creating or merging branches

## Remote

Personal GitHub account (not ICL-System org).

## Commit Message Format

```
type(scope): Brief description

- What changed
- Why it changed
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`
Scopes: `editor`, `toolbar`, `output`, `ast`, `pipeline`, `icl`, `ui`, `deploy`, `config`

## Procedure

1. **`cd` into the repo**: `cd /home/opeworld/Documents/RobustBrains/icl-playground`
2. Ensure on correct branch
3. `npm run build` must pass
4. Stage and commit
5. Push to remote

## Rules

- **Never force-push to main**
- **Every commit builds** — `npm run build` passes
- **Atomic commits** — one logical change per commit
- After finishing each x.x sub-phase: always `git commit && git push`
