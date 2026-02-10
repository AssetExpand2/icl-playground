---
applyTo: "**/*.tsx,**/*.ts"
---

# React/TypeScript Development — ICL Playground

## Stack

- Vite + React + TypeScript
- Tailwind CSS for styling
- Monaco Editor for code editing
- `icl-runtime` (npm) for all ICL operations

## Rules

1. **All ICL logic goes through `src/icl/runtime.ts`** — components never import `icl-runtime` directly
2. **TypeScript strict mode** — no `any` types unless absolutely necessary
3. **Functional components only** — no class components
4. **Custom hooks** in `src/hooks/` for reusable logic
5. **No server-side code** — everything runs client-side via WASM

## Component Conventions

- One component per file
- File name matches component name: `AstViewer.tsx` exports `AstViewer`
- Props interfaces defined in the same file: `interface AstViewerProps { ... }`
- Use `React.FC<Props>` or plain function signatures

## Error Handling

- WASM operations can throw — always wrap in try/catch
- Show errors in the UI (OutputPanel), never swallow them
- Loading states while WASM initializes or runs

## Before Committing

**ALWAYS prefix npm commands with `cd` into the project directory — background terminals start at workspace root.**

```bash
cd /home/opeworld/Documents/RobustBrains/icl-playground && npm run build    # Must succeed — no TypeScript errors
cd /home/opeworld/Documents/RobustBrains/icl-playground && npm run lint     # If configured
```
