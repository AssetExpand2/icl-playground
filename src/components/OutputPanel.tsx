import { useState, useCallback } from 'react';
import type { IclResult } from '../icl/types';
import { AstViewer } from './AstViewer';
import { PipelineView } from './PipelineView';
import { DeterminismCheck } from './DeterminismCheck';
import { ContractDiff } from './ContractDiff';
import { ExecutionPanel } from './ExecutionPanel';
import { ExportPanel } from './ExportPanel';
import { HelpPanel } from './HelpPanel';
import { CopyButton } from './CopyButton';

// --- Tab Definitions ---

type TabId = 'result' | 'errors' | 'ast-tree' | 'ast' | 'pipeline' | 'determinism' | 'diff' | 'execute' | 'export';

type GroupId = 'output' | 'tools' | 'help';

interface TabDef {
  id: TabId;
  label: string;
  group: GroupId;
}

interface GroupDef {
  id: GroupId;
  label: string;
  icon: string;
}

const GROUPS: GroupDef[] = [
  { id: 'output', label: 'Output', icon: '⎙' },
  { id: 'tools', label: 'Tools', icon: '⚙' },
  { id: 'help', label: 'Help', icon: '?' },
];

const TABS: TabDef[] = [
  // Output group
  { id: 'result', label: 'Result', group: 'output' },
  { id: 'errors', label: 'Errors', group: 'output' },
  { id: 'ast-tree', label: 'AST Tree', group: 'output' },
  { id: 'ast', label: 'AST JSON', group: 'output' },
  // Tools group
  { id: 'pipeline', label: 'Pipeline', group: 'tools' },
  { id: 'determinism', label: 'Determinism', group: 'tools' },
  { id: 'diff', label: 'Diff', group: 'tools' },
  { id: 'execute', label: 'Execute', group: 'tools' },
  { id: 'export', label: 'Export', group: 'tools' },
];

// --- Error Parsing ---

interface ParsedError {
  message: string;
  line?: number;
  column?: number;
}

function parseErrors(result: IclResult): ParsedError[] {
  if (result.success && !result.error) return [];

  const errors: ParsedError[] = [];

  // Try to parse structured verification errors from JSON output
  if (result.action === 'verify' && result.output) {
    try {
      const parsed = JSON.parse(result.output);
      if (parsed.errors && Array.isArray(parsed.errors)) {
        for (const e of parsed.errors) {
          errors.push({
            message: e.message || String(e),
            line: e.location?.line,
            column: e.location?.column,
          });
        }
      }
    } catch {
      // Not JSON — fall through to raw error
    }
  }

  // Raw error message — try to extract line:col pattern
  if (result.error) {
    const lineMatch = result.error.match(/line\s+(\d+)(?:,?\s*col(?:umn)?\s+(\d+))?/i);
    errors.push({
      message: result.error,
      line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
      column: lineMatch?.[2] ? parseInt(lineMatch[2], 10) : undefined,
    });
  }

  return errors;
}

function tryParseAst(result: IclResult): string | null {
  if (result.action !== 'parse' || !result.output) return null;
  try {
    const parsed = JSON.parse(result.output);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return result.output;
  }
}

// --- Component ---

interface OutputPanelProps {
  result: IclResult | null;
  source: string;
  onGoToLine?: (line: number, column?: number) => void;
}

// Default tab per group so switching groups lands on something sensible
const DEFAULT_TAB: Partial<Record<GroupId, TabId>> = {
  output: 'result',
  tools: 'pipeline',
};

export function OutputPanel({ result, source, onGoToLine }: OutputPanelProps) {
  const [activeGroup, setActiveGroup] = useState<GroupId>('output');
  const [activeTab, setActiveTab] = useState<TabId>('result');

  const errors = result ? parseErrors(result) : [];
  const errorCount = errors.length;

  const visibleTabs = TABS.filter((t) => t.group === activeGroup);

  const handleGroupSwitch = useCallback(
    (group: GroupId) => {
      setActiveGroup(group);
      // Help group has no sub-tabs
      if (group === 'help') return;
      // If current tab isn't in the new group, switch to the group default
      const tabsInGroup = TABS.filter((t) => t.group === group);
      if (!tabsInGroup.some((t) => t.id === activeTab)) {
        setActiveTab(DEFAULT_TAB[group]!);
      }
    },
    [activeTab],
  );

  const handleErrorClick = useCallback(
    (error: ParsedError) => {
      if (error.line && onGoToLine) {
        onGoToLine(error.line, error.column);
      }
    },
    [onGoToLine],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Group switcher */}
      <div className="flex items-center gap-1 px-2 pt-1.5 pb-0 bg-gray-900/80">
        {GROUPS.map(({ id, label, icon }) => (
          <button
            key={id}
            data-tour={`group-${id}`}
            onClick={() => handleGroupSwitch(id)}
            className={`
              px-3 py-1 text-xs font-semibold rounded-t border border-b-0 transition-colors active:scale-[0.97]
              ${activeGroup === id
                ? 'bg-gray-800 text-gray-50 border-gray-700'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/50 hover:border-gray-700'
              }
            `}
          >
            <span className="mr-1">{icon}</span>
            {label}
          </button>
        ))}

        {/* Duration badge — always visible */}
        {result && (
          <span className="ml-auto px-2 text-xs text-gray-600">
            {result.durationMs.toFixed(1)}ms
          </span>
        )}
      </div>

      {/* Tab bar — only tabs for active group (hidden for help) */}
      {activeGroup !== 'help' && (
      <div className="flex border-b border-gray-800 bg-gray-900/80 px-1">
        {visibleTabs.map(({ id, label }) => (
          <button
            key={id}
            data-tour={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`
              px-3 py-1.5 text-sm font-medium transition-colors
              ${activeTab === id
                ? 'text-gray-50 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-300'
              }
            `}
          >
            {label}
            {id === 'errors' && errorCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-400">
                {errorCount}
              </span>
            )}
          </button>
        ))}
      </div>
      )}

      {/* Tab content */}
      {activeGroup === 'help' ? (
        <div className="flex-1 overflow-auto p-4">
          <HelpPanel />
        </div>
      ) : activeTab === 'execute' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ExecutionPanel source={source} />
        </div>
      ) : activeTab === 'diff' ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <ContractDiff initialLeft={source} />
        </div>
      ) : (
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'determinism' ? (
          <DeterminismCheck source={source} />
        ) : activeTab === 'export' ? (
          <ExportPanel source={source} lastOutput={result?.output} />
        ) : activeTab === 'pipeline' ? (
          <PipelineView source={source} />
        ) : !result ? (
          <TabHint tab={activeTab} />
        ) : activeTab === 'result' ? (
          <ResultTab result={result} />
        ) : activeTab === 'errors' ? (
          <ErrorsTab errors={errors} onErrorClick={handleErrorClick} />
        ) : activeTab === 'ast-tree' ? (
          <AstTreeTab result={result} onGoToLine={onGoToLine} />
        ) : (
          <AstTab result={result} />
        )}
      </div>
      )}
    </div>
  );
}

// --- Tab Content ---

const TAB_HINTS: Record<string, { icon: string; heading: string; detail: string }> = {
  result: {
    icon: '⎔',
    heading: 'No output yet',
    detail: 'Click Parse, Normalize, Verify, or Hash in the toolbar to see results here.',
  },
  errors: {
    icon: '✓',
    heading: 'No errors to show',
    detail: 'Run any toolbar action — errors and warnings will appear here with clickable line links.',
  },
  'ast-tree': {
    icon: '🌳',
    heading: 'AST Tree',
    detail: 'Click Parse in the toolbar to generate the Abstract Syntax Tree. You can expand/collapse nodes and click to jump to source lines.',
  },
  ast: {
    icon: '{ }',
    heading: 'AST JSON',
    detail: 'Click Parse to view the raw JSON representation of the contract\'s syntax tree.',
  },
};

function TabHint({ tab }: { tab: TabId }) {
  const hint = TAB_HINTS[tab];
  if (!hint) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <span className="text-2xl mb-2">⎔</span>
        <p className="text-sm">Click a toolbar button to run an ICL operation</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-600 max-w-xs mx-auto text-center">
      <span className="text-2xl mb-2">{hint.icon}</span>
      <p className="text-sm font-medium text-gray-500 mb-1">{hint.heading}</p>
      <p className="text-xs text-gray-600 leading-relaxed">{hint.detail}</p>
    </div>
  );
}

function ResultTab({ result }: { result: IclResult }) {
  return (
    <div className="space-y-3">
      {/* Status line */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            result.success ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium text-gray-300">
          {result.action.charAt(0).toUpperCase() + result.action.slice(1)}
          {result.success ? ' — Success' : ' — Failed'}
        </span>
      </div>

      {/* Output */}
      {result.error ? (
        <div>
          <pre className="text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap font-mono bg-red-100 dark:bg-red-950/30 rounded p-3">
            {result.error}
          </pre>

          {/* Context-aware help */}
          <ErrorHelp action={result.action} error={result.error} />
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <CopyButton text={formatOutput(result)} />
          </div>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800/50 rounded p-3 pr-20">
            {formatOutput(result)}
          </pre>
        </div>
      )}
    </div>
  );
}

function ErrorsTab({
  errors,
  onErrorClick,
}: {
  errors: ParsedError[];
  onErrorClick: (err: ParsedError) => void;
}) {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <span className="text-2xl mb-2">✓</span>
        <p className="text-sm">No errors</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors.map((err, i) => (
        <button
          key={i}
          onClick={() => onErrorClick(err)}
          disabled={!err.line}
          className={`
            w-full text-left p-3 rounded text-sm
            bg-red-100 dark:bg-red-950/20 border border-red-300 dark:border-red-900/30
            ${err.line ? 'hover:bg-red-200 dark:hover:bg-red-950/40 cursor-pointer' : 'cursor-default'}
          `}
        >
          <div className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-500 shrink-0">✕</span>
            <div>
              <p className="text-red-800 dark:text-red-300 font-mono text-xs">{err.message}</p>
              {err.line && (
                <p className="text-red-600/70 dark:text-red-500/70 text-xs mt-1">
                  Line {err.line}
                  {err.column ? `, Column ${err.column}` : ''}
                  {' — click to jump'}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function AstTreeTab({
  result,
  onGoToLine,
}: {
  result: IclResult;
  onGoToLine?: (line: number, column?: number) => void;
}) {
  const astJson = result.action === 'parse' && result.success ? result.output : null;
  return <AstViewer astJson={astJson} onNodeClick={onGoToLine} />;
}

function AstTab({ result }: { result: IclResult }) {
  const ast = tryParseAst(result);

  if (!ast) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <span className="text-2xl mb-2">{ }</span>
        <p className="text-sm">Run "Parse" to see the AST</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <CopyButton text={ast} />
      </div>
      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800/50 rounded p-3 pr-20">
        {ast}
      </pre>
    </div>
  );
}

// --- Helpers ---

interface ErrorHelpInfo {
  explanation: string;
  tips: string[];
  example?: string;
}

function getErrorHelp(action: string, error: string): ErrorHelpInfo {
  const lowerErr = error.toLowerCase();

  // Execute errors
  if (action === 'execute') {
    if (lowerErr.includes('operation') && lowerErr.includes('field')) {
      return {
        explanation: 'The runtime expects a JSON object with an "operation" field that matches a BehavioralSemantics operation name.',
        tips: [
          'Add an "operation" field to your input JSON',
          'The value must match a name in the contract\'s operations list',
          'Include an "inputs" object with required parameters',
        ],
        example: `{\n  "operation": "echo",\n  "inputs": {\n    "message": "Hello, ICL!"\n  }\n}`,
      };
    }
    if (lowerErr.includes('operation') && (lowerErr.includes('not found') || lowerErr.includes('unknown'))) {
      return {
        explanation: 'The operation name doesn\'t match any operation defined in this contract.',
        tips: [
          'Check the contract\'s BehavioralSemantics → operations for valid names',
          'Operation names are case-sensitive',
        ],
      };
    }
    if (lowerErr.includes('parameter') || lowerErr.includes('input')) {
      return {
        explanation: 'One or more required input parameters are missing or have the wrong type.',
        tips: [
          'Check the operation\'s "parameters" definition for required fields',
          'Make sure each value matches the expected type (String, Integer, etc.)',
        ],
      };
    }
    return {
      explanation: 'The contract executed but encountered a runtime error.',
      tips: [
        'Verify the contract parses and normalizes without errors first',
        'Check that your input JSON is valid and matches the operation signature',
      ],
    };
  }

  // Parse errors
  if (action === 'parse') {
    if (lowerErr.includes('unexpected token') || lowerErr.includes('expected')) {
      return {
        explanation: 'The parser encountered unexpected syntax in the contract.',
        tips: [
          'Check for missing or extra braces { }',
          'Ensure strings are wrapped in double quotes "..."',
          'Verify section names are spelled correctly (Contract, Identity, etc.)',
        ],
      };
    }
    return {
      explanation: 'The contract could not be parsed. Check the syntax.',
      tips: [
        'Every contract starts with Contract "name" { ... }',
        'Sections like Identity, BehavioralSemantics must be inside the Contract block',
        'Field values need correct types: strings in quotes, numbers without',
      ],
      example: `Contract "my_contract" {\n  Identity {\n    stable_id: "abc-123"\n    version: "1.0.0"\n  }\n}`,
    };
  }

  // Normalize errors
  if (action === 'normalize') {
    return {
      explanation: 'Normalization failed — the contract structure may be incomplete.',
      tips: [
        'Make sure the contract parses successfully first (run Parse)',
        'Required sections or fields may be missing',
      ],
    };
  }

  // Verify errors
  if (action === 'verify') {
    return {
      explanation: 'Verification found issues with the contract\'s semantic validity.',
      tips: [
        'Check that all referenced operations have valid preconditions/postconditions',
        'Ensure required fields are present in each section',
        'Run Parse and Normalize first to rule out structural issues',
      ],
    };
  }

  // Hash errors
  if (action === 'hash') {
    return {
      explanation: 'Hashing failed — the contract must parse and normalize cleanly first.',
      tips: [
        'Run Parse → Normalize → Verify before hashing',
        'The hash is computed on the normalized form',
      ],
    };
  }

  // Fallback
  return {
    explanation: 'An error occurred while processing the contract.',
    tips: ['Try running Parse first to check syntax', 'Check the contract for typos or structural issues'],
  };
}

function ErrorHelp({ action, error }: { action: string; error: string }) {
  const help = getErrorHelp(action, error);
  return (
    <div className="mt-3 rounded border border-amber-400 dark:border-amber-800/40 bg-amber-100 dark:bg-amber-950/20 p-3">
      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">How to fix this</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{help.explanation}</p>
      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 list-disc list-inside mb-2">
        {help.tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
      {help.example && (
        <div className="bg-gray-900/80 rounded p-2 border border-gray-700">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Example</p>
          <pre className="text-xs text-gray-300 font-mono whitespace-pre">{help.example}</pre>
        </div>
      )}
    </div>
  );
}

function formatOutput(result: IclResult): string {
  if (!result.output) return '(empty)';

  // Try to pretty-print JSON
  try {
    const parsed = JSON.parse(result.output);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return result.output;
  }
}
