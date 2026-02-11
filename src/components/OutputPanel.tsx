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

type TabId = 'result' | 'errors' | 'ast-tree' | 'ast' | 'pipeline' | 'determinism' | 'diff' | 'execute' | 'export' | 'help';

type GroupId = 'output' | 'tools';

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
  { id: 'help', label: 'Help', group: 'tools' },
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
const DEFAULT_TAB: Record<GroupId, TabId> = {
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
      // If current tab isn't in the new group, switch to the group default
      const tabsInGroup = TABS.filter((t) => t.group === group);
      if (!tabsInGroup.some((t) => t.id === activeTab)) {
        setActiveTab(DEFAULT_TAB[group]);
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

      {/* Tab bar — only tabs for active group */}
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
              <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-red-900/50 text-red-400">
                {errorCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'execute' ? (
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
        ) : activeTab === 'help' ? (
          <HelpPanel />
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
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <CopyButton text={result.error} />
          </div>
          <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono bg-red-950/30 rounded p-3 pr-20">
            {result.error}
          </pre>
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
            bg-red-950/20 border border-red-900/30
            ${err.line ? 'hover:bg-red-950/40 cursor-pointer' : 'cursor-default'}
          `}
        >
          <div className="flex items-start gap-2">
            <span className="text-red-500 shrink-0">✕</span>
            <div>
              <p className="text-red-300 font-mono text-xs">{err.message}</p>
              {err.line && (
                <p className="text-red-500/70 text-xs mt-1">
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
