# ICL Playground — Roadmap & Progress Tracker

**Started:** 2026-02-10
**Status:** Phase 6 — In Progress

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
- [x] Commit and push

---

## Phase 2: Example Contracts & UX

### 2.1 — Example Picker

- [x] Create `ExamplePicker.tsx` — dropdown to select example contracts
- [x] Load examples from `public/examples/` at build time
- [x] Selecting an example replaces editor content
- [x] Confirm dialog if editor has unsaved changes
- [x] Commit and push

### 2.2 — Status Bar

- [x] Create `StatusBar.tsx` — bottom bar
- [x] Show `icl-runtime` version
- [x] Show parse status (valid / error count)
- [x] Show cursor position (line:column)
- [x] Commit and push

### 2.3 — Layout & Responsive Design

- [x] Split-pane layout: editor left, output right
- [x] Draggable divider between panes
- [x] Responsive: stack vertically on mobile
- [x] Commit and push

---

## Phase 3: AST Visualization

### 3.1 — AST Tree View

- [x] Create `AstViewer.tsx` — interactive tree view of AST
- [x] Expand/collapse nodes
- [x] Click a node to highlight corresponding source in editor
- [x] Show node types with icons/colors
- [x] Commit and push

### 3.2 — Pipeline Visualization

- [x] Create `PipelineView.tsx` — shows the ICL pipeline stages
- [x] Visual: Source → Parse → Normalize → Verify → Execute
- [x] Each stage shows its output
- [x] Step-through mode: click "Next" to advance one stage at a time
- [x] Highlight current stage
- [x] Commit and push

---

## Phase 4: Advanced Features

### 4.1 — Determinism Check

- [x] "Determinism Check" button — parse same contract N times, compare hashes
- [x] Show result: all identical = green, any mismatch = red (should never happen)
- [x] Display iteration count and time taken
- [x] Commit and push

### 4.2 — Contract Diff

- [x] Side-by-side editor: two contracts
- [x] "Diff" button — normalize both, show semantic diff
- [x] Highlight additions/removals
- [x] Commit and push

### 4.3 — Execution

- [x] "Execute" button — run contract with user-provided input JSON
- [x] Input panel for execution parameters
- [x] Show execution result, postcondition checks, provenance log
- [x] Commit and push

---

## Phase 5: Polish & Deploy

### 5.1 — Theme & Appearance

- [x] Dark/light theme toggle
- [x] Persist theme preference in localStorage
- [x] Consistent color scheme matching ICL branding
- [x] Commit and push

### 5.2 — Shareable Links

- [x] Encode contract source in URL (base64 or compressed)
- [x] Loading a shared URL populates the editor
- [x] "Share" button copies link to clipboard
- [x] Commit and push

### 5.3 — Export

- [x] "Export AST" — download AST as JSON file
- [x] "Export Normalized" — download canonical form as `.icl` file
- [x] "Copy to Clipboard" for all outputs
- [x] Commit and push

### 5.4 — Deployment

- [x] Set up GitHub Pages or Vercel deployment
- [x] CI: build on push to main, auto-deploy
- [x] Add deployment URL to README
- [x] Commit and push

---

## Phase 6: UI Refinements

### 6.1 — Tab Grouping

- [x] Group OutputPanel tabs into sections: **Output** (Result, Errors, AST Tree, AST JSON) and **Tools** (Pipeline, Determinism, Diff, Execute, Export)
- [x] Section switcher bar above tabs (two clickable group labels)
- [x] Only show tabs for the active group — eliminates overflow
- [x] Persist active group in component state
- [x] Responsive: works on narrow screens without scroll
- [x] Commit and push

---

## Phase 7: Onboarding & Help

### 7.1 — Welcome Overlay

- [x] First-visit welcome modal explaining what ICL is in 2-3 sentences
- [x] Quick-start: "Try clicking Parse →" with arrow pointing to toolbar
- [x] "Don't show again" checkbox, persisted in localStorage
- [ ] Commit and push

### 7.2 — Contextual Placeholders & Hints

- [ ] Empty editor placeholder text: brief ICL contract skeleton with comments
- [ ] Each OutputPanel tab shows a help hint when empty (e.g., "Run Parse to see the AST here")
- [ ] Execute tab: explain `{"operation": "...", "inputs": {...}}` format visually
- [ ] Diff tab: explain what normalization-based diffing means
- [ ] Determinism tab: explain what deterministic hashing proves
- [ ] Commit and push

### 7.3 — Interactive Guided Tour

- [ ] Step-by-step tooltip tour: Editor → Parse → AST Tree → Normalize → Verify → Hash
- [ ] Each step highlights the relevant UI area with a pulsing border
- [ ] "Next" / "Skip" buttons to advance or dismiss
- [ ] Triggered by "?" help button in header (always accessible)
- [ ] Commit and push

### 7.4 — ICL Quick Reference Panel

- [ ] New "Help" tab in OutputPanel with collapsible sections:
  - What is ICL? (2-paragraph summary)
  - Contract structure (all 7 sections with 1-line descriptions)
  - Pipeline stages explained (Parse → Normalize → Verify → Hash → Execute)
  - Input format for Execute (`operation` + `inputs` explained)
  - Links to full docs (ICL-Docs, ICL-Spec)
- [ ] Searchable / filterable
- [ ] Commit and push

### 7.5 — Improved Example Contracts

- [ ] Add 2-3 more examples covering different use cases (data governance, IoT, access control)
- [ ] Each example includes header comments explaining what it demonstrates
- [ ] Example picker shows a "complexity" badge (beginner / intermediate / advanced)
- [ ] Commit and push
