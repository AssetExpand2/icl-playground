---
applyTo: "**/icl/**"
---

# ICL Integration — ICL Playground

## The Rule

All ICL functionality comes from the `icl-runtime` npm package. This package provides a WASM-based runtime.

## Wrapper Pattern

`src/icl/runtime.ts` is the single entry point for all ICL operations:

```typescript
import { parseContract, normalize, verify, execute, hash } from 'icl-runtime';
```

Components call wrapper functions, never import `icl-runtime` directly. This allows:
- Centralized error handling
- Easy mocking for tests
- Graceful degradation if WASM fails to load

## Type Safety

`src/icl/types.ts` mirrors the ICL AST types in TypeScript. Keep in sync with the `icl-runtime` package's exported types.

## Honesty

If a function in `icl-runtime` doesn't exist yet or doesn't work:
- Grey out the corresponding UI button
- Show "Not available in icl-runtime vX.Y.Z" tooltip
- Never fake or mock results in production
