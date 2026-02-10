# ICL Playground — Roadmap & Progress Tracker

**Started:** 2026-02-10
**Status:** Phase 1 — In Progress

> Check boxes as each step is completed. Each phase must be finished before starting the next.

---

## Phase 0: Project Setup

### 0.1 — Initialize Repository

- [x] Create GitHub repo (`icl-playground`) under personal account, public
- [x] Clone locally to `/home/opeworld/Documents/RobustBrains/icl-playground/`
- [x] Initialize Vite + React + TypeScript (`npm create vite@latest`)
- [x] Install Tailwind CSS
- [x] Install Monaco Editor (`@monaco-editor/react`)
- [x] Install `icl-runtime` from npm
- [x] Verify `npm run dev` starts and renders a blank page
- [x] Commit and push

### 0.2 — Project Structure

- [x] Create `src/components/` directory
- [x] Create `src/icl/` directory
- [x] Create `src/hooks/` directory
- [x] Create `public/examples/` with 3 example `.icl` contracts (copy from ICL-Spec)
- [x] Set up `src/icl/runtime.ts` — import and wrap `icl-runtime` npm package
- [x] Set up `src/icl/types.ts` — TypeScript types for ICL AST
- [x] Verify `icl-runtime` loads correctly in the browser (WASM initializes)
- [x] Commit and push

---

## Phase 1: Core Editor

### 1.1 — Monaco Editor Integration

- [x] Create `Editor.tsx` — Monaco editor component
- [x] Configure Monaco for a custom ICL language (basic keyword highlighting)
- [x] ICL keywords: `Contract`, `Identity`, `PurposeStatement`, `DataSemantics`, `BehavioralSemantics`, `ExecutionConstraints`, `HumanMachineContract`, `Extensions`
- [x] ICL types: `Integer`, `Float`, `String`, `Boolean`, `ISO8601`, `UUID`, `Array`, `Map`, `Enum`, `Object`
- [x] Editor fills available space, resizable
- [x] Load default example contract on startup
- [x] Commit and push

### 1.2 — Toolbar Actions

- [x] Create `Toolbar.tsx` with action buttons
- [x] "Parse" button — calls `icl-runtime` parse function
- [x] "Normalize" button — calls normalize function
- [x] "Verify" button — calls verify function
- [x] "Hash" button — calls hash function
- [x] "Format" button — calls fmt and replaces editor content
- [x] Buttons show loading state while WASM runs
- [x] Disable buttons for functions not yet available in `icl-runtime`
- [x] Commit and push

### 1.3 — Output Panel

- [x] Create `OutputPanel.tsx` — tabbed output area
- [x] "Result" tab — shows normalized output, hash, etc.
- [x] "Errors" tab — shows parse/verify errors with line numbers
- [x] "AST" tab — shows raw AST JSON (pretty-printed)
- [x] Clicking an error jumps to the line in the editor
- [ ] Commit and push

---

## Phase 2: Example Contracts & UX

### 2.1 — Example Picker

- [x] Create `ExamplePicker.tsx` — dropdown to select example contracts
- [x] Load examples from `public/examples/` at build time
- [x] Selecting an example replaces editor content
- [x] Confirm dialog if editor has unsaved changes
- [ ] Commit and push

### 2.2 — Status Bar

- [ ] Create `StatusBar.tsx` — bottom bar
- [ ] Show `icl-runtime` version
- [ ] Show parse status (valid / error count)
- [ ] Show cursor position (line:column)
- [ ] Commit and push

### 2.3 — Layout & Responsive Design

- [ ] Split-pane layout: editor left, output right
- [ ] Draggable divider between panes
- [ ] Responsive: stack vertically on mobile
- [ ] Commit and push

---

## Phase 3: AST Visualization

### 3.1 — AST Tree View

- [ ] Create `AstViewer.tsx` — interactive tree view of AST
- [ ] Expand/collapse nodes
- [ ] Click a node to highlight corresponding source in editor
- [ ] Show node types with icons/colors
- [ ] Commit and push

### 3.2 — Pipeline Visualization

- [ ] Create `PipelineView.tsx` — shows the ICL pipeline stages
- [ ] Visual: Source → Parse → Normalize → Verify → Execute
- [ ] Each stage shows its output
- [ ] Step-through mode: click "Next" to advance one stage at a time
- [ ] Highlight current stage
- [ ] Commit and push

---

## Phase 4: Advanced Features

### 4.1 — Determinism Check

- [ ] "Determinism Check" button — parse same contract N times, compare hashes
- [ ] Show result: all identical = green, any mismatch = red (should never happen)
- [ ] Display iteration count and time taken
- [ ] Commit and push

### 4.2 — Contract Diff

- [ ] Side-by-side editor: two contracts
- [ ] "Diff" button — normalize both, show semantic diff
- [ ] Highlight additions/removals
- [ ] Commit and push

### 4.3 — Execution

- [ ] "Execute" button — run contract with user-provided input JSON
- [ ] Input panel for execution parameters
- [ ] Show execution result, postcondition checks, provenance log
- [ ] Commit and push

---

## Phase 5: Polish & Deploy

### 5.1 — Theme & Appearance

- [ ] Dark/light theme toggle
- [ ] Persist theme preference in localStorage
- [ ] Consistent color scheme matching ICL branding
- [ ] Commit and push

### 5.2 — Shareable Links

- [ ] Encode contract source in URL (base64 or compressed)
- [ ] Loading a shared URL populates the editor
- [ ] "Share" button copies link to clipboard
- [ ] Commit and push

### 5.3 — Export

- [ ] "Export AST" — download AST as JSON file
- [ ] "Export Normalized" — download canonical form as `.icl` file
- [ ] "Copy to Clipboard" for all outputs
- [ ] Commit and push

### 5.4 — Deployment

- [ ] Set up GitHub Pages or Vercel deployment
- [ ] CI: build on push to main, auto-deploy
- [ ] Add deployment URL to README
- [ ] Commit and push

---

## Future Ideas (Not Scheduled)

- [ ] Conformance test runner — run ICL-Spec conformance suite in browser
- [ ] VS Code theme for Monaco (match official ICL syntax colors)
- [ ] Collaborative editing (shared sessions)
- [ ] Embed mode (iframe-able for docs site)
- [ ] Performance benchmarks in browser
- [ ] PWA support (offline-first)
