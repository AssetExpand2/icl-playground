# ICL Playground — Master Plan

**Date:** 2026-02-10
**Author:** Personal account (not ICL-System org)
**Goal:** A web UI for writing, parsing, and testing ICL contracts interactively.

---

## Vision

ICL Playground is the go-to browser app for anyone who wants to try ICL without installing anything. Write a contract, see the AST, normalize it, verify it, execute it — all in the browser. Think "Rust Playground" or "TypeScript Playground" but for ICL.

---

## Relationship to ICL

This is a **consumer** of the ICL ecosystem, not a core component:

| Repo | Owner | Purpose |
|------|-------|---------|
| [ICL-Spec](https://github.com/ICL-System/ICL-Spec) | ICL-System org | The standard (spec + grammar + conformance) |
| [ICL-Runtime](https://github.com/ICL-System/ICL-Runtime) | ICL-System org | Canonical Rust implementation + bindings |
| [ICL-Docs](https://github.com/ICL-System/ICL-Docs) | ICL-System org | Documentation site |
| **icl-playground** | Personal account | **Testing/playground UI — this repo** |

The playground imports `icl-runtime` from npm (the published WASM binding) and wraps it in a React UI.

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build tool | Vite | Fast HMR, lightweight, no SSR needed |
| Framework | React + TypeScript | Component-based, great ecosystem |
| Code editor | Monaco Editor (`@monaco-editor/react`) | Same editor as VS Code, syntax highlighting |
| ICL runtime | `icl-runtime` (npm) | Published WASM binding — parse, normalize, verify, execute in-browser |
| Styling | Tailwind CSS | Rapid UI development, clean defaults |
| Deployment | GitHub Pages or Vercel | Free, static hosting |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Browser                         │
│                                                  │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │ Monaco Editor │───▶│  icl-runtime (WASM)    │ │
│  │ (ICL source)  │    │  parse() normalize()   │ │
│  └──────────────┘    │  verify() execute()    │ │
│         │            └──────────┬─────────────┘ │
│         │                       │               │
│         ▼                       ▼               │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │   Toolbar     │    │  Output Panels          │ │
│  │ (actions)     │    │  AST / Errors / Hash   │ │
│  └──────────────┘    └────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- **Zero server** — everything runs client-side via WASM
- **No backend** — no Express, no API, no database
- The `icl-runtime` npm package bundles the WASM binary + JS glue

---

## Project Structure

```
icl-playground/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── public/
│   └── examples/              # Pre-loaded .icl example contracts
│       ├── hello-world.icl
│       ├── db-write-validation.icl
│       └── api-rate-limiting.icl
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                # Root component + layout
│   ├── components/
│   │   ├── Editor.tsx         # Monaco editor wrapper
│   │   ├── Toolbar.tsx        # Action buttons (Parse, Normalize, Verify, etc.)
│   │   ├── OutputPanel.tsx    # Results display (errors, AST, hash)
│   │   ├── AstViewer.tsx      # Tree view of parsed AST
│   │   ├── PipelineView.tsx   # Step-through pipeline visualization
│   │   ├── ExamplePicker.tsx  # Dropdown to load example contracts
│   │   └── StatusBar.tsx      # Bottom bar with version, parse status
│   ├── icl/
│   │   ├── runtime.ts         # Wrapper around `icl-runtime` npm package
│   │   └── types.ts           # TypeScript types for ICL AST nodes
│   ├── hooks/
│   │   ├── useIcl.ts          # Hook for ICL operations
│   │   └── useTheme.ts        # Dark/light theme toggle
│   └── styles/
│       └── globals.css        # Tailwind imports + custom styles
├── .github/
│   ├── instructions/
│   └── skills/
├── PLAN.md
├── ROADMAP.md
└── README.md
```

---

## Key Decisions

### 1. npm package, not local WASM

Use `npm install icl-runtime` — the published package. No local path dependencies, no manual WASM loading. Anyone can clone and run.

### 2. Client-side only

No server. The WASM binding runs entirely in the browser. This means:
- Free to host (static files only)
- No latency for parse/normalize/verify
- Works offline after first load

### 3. Monaco over CodeMirror

Monaco provides the full VS Code editing experience (minimap, multi-cursor, find/replace). Heavier than CodeMirror but worth it for a playground focused on developer experience.

### 4. Tailwind over component libraries

Keeps the bundle small and gives full control. No Material UI or Ant Design overhead.

---

## Honesty Policy

Same as ICL: only show features that actually work. If the `icl-runtime` npm package doesn't support a function yet, grey out that button — don't fake it.
