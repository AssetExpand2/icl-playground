---
name: debugging
description: Use when investigating bugs, build failures, WASM loading issues, or unexpected behavior in icl-playground. Covers React component debugging, WASM/icl-runtime issues, and build errors.
---

# Debugging

## When to Use

- `npm run build` or `npm run dev` fails
- WASM doesn't load in the browser
- ICL operations return unexpected results
- UI components don't render correctly
- User reports a bug

## Procedure

1. **Reproduce** — Describe the exact steps to trigger the bug
2. **Read the error** — Full error message, browser console, terminal output
3. **Locate** — Which layer?
   - Build error → Vite/TypeScript config
   - WASM error → `icl-runtime` loading or API mismatch
   - UI error → React component logic
   - Styling error → Tailwind classes
4. **Isolate** — Minimal reproduction
5. **Fix** — Make the minimal change
6. **Verify** — `npm run build` passes, feature works in browser

## Common Issues

| Symptom | Likely cause |
|---------|-------------|
| WASM fails to load | WASM not served correctly by Vite, check `vite.config.ts` |
| `icl-runtime` function undefined | API changed between versions, check package docs |
| Monaco doesn't render | Missing CSS import or container has no height |
| Build fails with type errors | TypeScript types out of sync with `icl-runtime` |
| Blank page | Check browser console for runtime errors |
