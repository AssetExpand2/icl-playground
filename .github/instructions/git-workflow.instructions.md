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

1. **ALWAYS `cd` into the repo directory before ANY terminal command (git, npm, etc.)**: `cd /home/opeworld/Documents/RobustBrains/icl-playground`
2. **Background terminals start at workspace root** — they MUST use `cd /home/opeworld/Documents/RobustBrains/icl-playground && <command>` as a single command. Never run bare `npm run dev`, `npm run build`, `npm install`, or `git` commands without the `cd` prefix.
3. `npm run build` must pass before every commit
4. After finishing each x.x sub-phase: always `git commit && git push`
5. Commit messages reference the phase: "Phase 1.1", "Phase 2.3", etc.
6. Never force-push to main
