import { useState, useMemo } from 'react';

// --- Section Data ---

interface HelpSection {
  id: string;
  title: string;
  content: string;
}

const SECTIONS: HelpSection[] = [
  {
    id: 'what-is-icl',
    title: 'What is ICL?',
    content: `**ICL (Immutable Contract Language)** is a deterministic, verifiable language for defining contracts between systems, humans, and machines.

Every ICL contract produces the same canonical form and the same semantic hash regardless of environment — guaranteeing tamper-proof, auditable agreements. ICL is designed for scenarios where trust, transparency, and reproducibility are critical: data governance, API agreements, IoT device policies, and access control.`,
  },
  {
    id: 'contract-structure',
    title: 'Contract Structure',
    content: `An ICL contract has 7 top-level sections:

• **Identity** — Unique ID, version, timestamps, and owner
• **PurposeStatement** — Human-readable narrative and intent source
• **DataSemantics** — State schema with typed fields and invariants
• **BehavioralSemantics** — Operations with pre/postconditions and parameters
• **ExecutionConstraints** — Resource limits, timeouts, sandbox mode
• **HumanMachineContract** — System commitments, refusals, and human obligations
• **Extensions** — Custom metadata and extension fields`,
  },
  {
    id: 'pipeline-stages',
    title: 'Pipeline Stages',
    content: `The ICL processing pipeline has 5 stages:

1. **Parse** — Converts source text into an Abstract Syntax Tree (AST)
2. **Normalize** — Transforms the AST into a deterministic canonical form (consistent key order, whitespace, formatting)
3. **Verify** — Validates the contract against ICL rules: required fields, type constraints, structural integrity
4. **Hash** — Generates a deterministic semantic hash of the normalized form — the same contract always produces the same hash
5. **Execute** — Runs an operation defined in the contract with given input parameters`,
  },
  {
    id: 'execute-format',
    title: 'Execute Input Format',
    content: `The Execute tab expects a JSON object with two fields:

\`\`\`json
{
  "operation": "operation_name",
  "inputs": {
    "param1": "value1",
    "param2": 42
  }
}
\`\`\`

• **operation** — The name of an operation defined in the contract's BehavioralSemantics
• **inputs** — A JSON object mapping parameter names to values, matching the operation's parameter types`,
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    content: `• **⌘1 / Ctrl+1** — Parse
• **⌘2 / Ctrl+2** — Normalize
• **⌘3 / Ctrl+3** — Verify
• **⌘4 / Ctrl+4** — Hash
• **⌘5 / Ctrl+5** — Execute`,
  },
  {
    id: 'links',
    title: 'Links & Resources',
    content: `• [ICL Specification](https://github.com/ICL-System/ICL-Spec) — Full language specification and grammar
• [ICL Runtime](https://github.com/ICL-System/ICL-Runtime) — Rust runtime with WASM support
• [ICL Documentation](https://github.com/ICL-System/ICL-Docs) — Comprehensive guides and tutorials`,
  },
];

// --- Collapsible Section ---

function Section({
  section,
  expanded,
  onToggle,
}: {
  section: HelpSection;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left
          bg-gray-900/60 hover:bg-gray-800/80 transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">{section.title}</span>
        <span className={`text-gray-500 text-xs transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="px-4 py-3 text-sm text-gray-400 leading-relaxed whitespace-pre-line">
          <FormattedContent text={section.content} />
        </div>
      )}
    </div>
  );
}

// --- Simple markdown-ish formatting ---

function FormattedContent({ text }: { text: string }) {
  // Convert **bold**, `code`, and [links](url)
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, i) => {
        // Convert markdown-ish patterns
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
        const elements = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-gray-200 font-semibold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={j} className="text-blue-400 bg-gray-800/50 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
          }
          const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            return (
              <a
                key={j}
                href={linkMatch[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {linkMatch[1]}
              </a>
            );
          }
          return <span key={j}>{part}</span>;
        });

        return (
          <span key={i}>
            {elements}
            {i < lines.length - 1 && '\n'}
          </span>
        );
      })}
    </>
  );
}

// --- Component ---

export function HelpPanel() {
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['what-is-icl']));

  const filteredSections = useMemo(() => {
    if (!search.trim()) return SECTIONS;
    const q = search.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q),
    );
  }, [search]);

  const toggleSection = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help topics..."
          className="w-full px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded
            text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-auto space-y-2">
        {filteredSections.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            No matching help topics for "{search}"
          </div>
        ) : (
          filteredSections.map((section) => (
            <Section
              key={section.id}
              section={section}
              expanded={expandedIds.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
