# ICL Playground

> **Write, parse, verify, and execute [ICL](https://github.com/ICL-System/ICL-Spec) contracts — entirely in your browser.**

[![Live Demo](https://img.shields.io/badge/demo-icl--playground.vercel.app-blue)](https://icl-playground.vercel.app)
[![Built with](https://img.shields.io/badge/built_with-icl--runtime_WASM-green)](https://www.npmjs.com/package/icl-runtime)

**[Try it live →](https://icl-playground.vercel.app)**

## What Is ICL?

**Intent Contract Language (ICL)** is a declarative language for defining contracts between humans and machines. Contracts specify identity, purpose, data semantics, behavioral rules, execution constraints, and mutual commitments — all in a single, self-describing document that is deterministically parseable, normalizable, and hashable.

## What Is This?

ICL Playground is a zero-install, browser-based IDE for ICL contracts. Everything runs client-side via WebAssembly — no server, no backend, no data leaves your machine.

### Features

| Feature | Description |
|---------|-------------|
| **Monaco Editor** | VS Code-quality editing with ICL syntax highlighting |
| **Full Pipeline** | Parse → Normalize → Verify → Hash — one click each |
| **AST Explorer** | Interactive tree view with click-to-navigate |
| **Pipeline Visualizer** | Step-through the ICL pipeline stage by stage |
| **Execution** | Run contracts with custom JSON input |
| **Generate Template** | Auto-generate JSON input from contract operations |
| **Determinism Check** | Hash N times, prove identical results |
| **Contract Diff** | Side-by-side normalized diff of two contracts |
| **Export** | Download AST JSON, normalized ICL, or copy to clipboard |
| **Shareable Links** | Encode contracts in URL — share with a link |
| **Guided Tour** | Step-by-step interactive walkthrough of the UI |
| **Help Panel** | Searchable ICL quick reference with examples |
| **Dark / Light Theme** | Toggle with localStorage persistence |
| **Example Contracts** | 6 pre-loaded examples with complexity badges |

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
