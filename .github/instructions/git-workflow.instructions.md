---
applyTo: "**"
---

# Git Workflow — ICL Playground

## Remote

Personal account repo (not ICL-System org): `git@github.com:<username>/icl-playground.git`

## Commit Message Format

```
type(scope): Brief description

- What changed
- Why it changed
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`
Scopes: `editor`, `toolbar`, `output`, `ast`, `pipeline`, `icl`, `ui`, `deploy`, `config`

## Rules

1. **ALWAYS `cd` into the repo directory before any git command**: `cd /home/opeworld/Documents/RobustBrains/icl-playground`
2. `npm run build` must pass before every commit
3. After finishing each x.x sub-phase: always `git commit && git push`
4. Commit messages reference the phase: "Phase 1.1", "Phase 2.3", etc.
5. Never force-push to main
