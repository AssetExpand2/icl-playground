---
applyTo: "**/components/**"
---

# UI Components — ICL Playground

## Layout

Split-pane: editor on the left, output on the right. Toolbar at top. Status bar at bottom.

## Component Responsibilities

| Component | Does | Does NOT |
|-----------|------|----------|
| `Editor.tsx` | Monaco editor, syntax highlighting, cursor events | Parse, normalize, or call ICL functions |
| `Toolbar.tsx` | Action buttons, loading states | Display results |
| `OutputPanel.tsx` | Tabbed results (Result, Errors, AST) | Edit contracts |
| `AstViewer.tsx` | Tree view of AST nodes | Parse contracts |
| `PipelineView.tsx` | Visual pipeline stages | Run pipeline logic |
| `ExamplePicker.tsx` | Load example contracts | Store contracts |
| `StatusBar.tsx` | Version, parse status, cursor position | Trigger actions |

## Styling

- Tailwind CSS utility classes only — no inline styles, no CSS modules
- Dark/light theme via Tailwind's `dark:` variant
- Responsive: `flex`, `grid`, breakpoints for mobile stacking
