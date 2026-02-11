# ICL Playground

A web UI for writing, parsing, and testing [ICL](https://github.com/ICL-System/ICL-Spec) (Intent Contract Language) contracts interactively in the browser.

> **Live:** [https://assetexpand2.github.io/icl-playground/](https://assetexpand2.github.io/icl-playground/)
>
> **Status:** All phases complete — Dark/light theme, shareable links, export, auto-deploy

## What Is This?

ICL Playground lets you:
- Write ICL contracts in a Monaco editor (same editor as VS Code)
- Parse, normalize, verify, and hash contracts — all client-side via WASM
- Visualize the AST and pipeline stages
- Run determinism checks and contract diffs
- Execute contracts with custom input JSON
- Export AST/normalized output and share contracts via URL
- Toggle dark/light theme
- Load example contracts to learn the syntax

Everything runs in the browser using the [`icl-runtime`](https://www.npmjs.com/package/icl-runtime) npm package (WASM binding of the Rust implementation). No server required.

## Quick Start

```bash
git clone https://github.com/assetexpand2/icl-playground.git
cd icl-playground
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Tech Stack

- **Vite + React + TypeScript** — fast build, component-based UI
- **Monaco Editor** — code editing with syntax highlighting
- **icl-runtime** — WASM-based ICL parser/normalizer/verifier
- **Tailwind CSS** — utility-first styling

## Related Repos

| Repo | Purpose |
|------|---------|
| [ICL-Spec](https://github.com/ICL-System/ICL-Spec) | The ICL standard (spec + grammar + conformance tests) |
| [ICL-Runtime](https://github.com/ICL-System/ICL-Runtime) | Canonical Rust implementation + CLI + language bindings |
| [ICL-Docs](https://github.com/ICL-System/ICL-Docs) | Documentation website |

## License

MIT
