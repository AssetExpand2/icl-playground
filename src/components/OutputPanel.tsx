import { useState, useCallback } from 'react';
import type { IclResult } from '../icl/types';

// --- Tab Definitions ---

type TabId = 'result' | 'errors' | 'ast';

interface TabDef {
  id: TabId;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'result', label: 'Result' },
  { id: 'errors', label: 'Errors' },
  { id: 'ast', label: 'AST' },
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
  onGoToLine?: (line: number, column?: number) => void;
}

export function OutputPanel({ result, onGoToLine }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('result');

  const errors = result ? parseErrors(result) : [];
  const errorCount = errors.length;

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
      {/* Tab bar */}
      <div className="flex border-b border-gray-800 bg-gray-900/80">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${activeTab === id
                ? 'text-white border-b-2 border-blue-500'
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

        {/* Duration badge */}
        {result && (
          <span className="ml-auto px-3 py-2 text-xs text-gray-600">
            {result.durationMs.toFixed(1)}ms
          </span>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {!result ? (
          <EmptyState />
        ) : activeTab === 'result' ? (
          <ResultTab result={result} />
        ) : activeTab === 'errors' ? (
          <ErrorsTab errors={errors} onErrorClick={handleErrorClick} />
        ) : (
          <AstTab result={result} />
        )}
      </div>
    </div>
  );
}

// --- Tab Content ---

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-600">
      <span className="text-2xl mb-2">⎔</span>
      <p className="text-sm">Click a toolbar button to run an ICL operation</p>
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
        <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono bg-red-950/30 rounded p-3">
          {result.error}
        </pre>
      ) : (
        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800/50 rounded p-3">
          {formatOutput(result)}
        </pre>
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
    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800/50 rounded p-3">
      {ast}
    </pre>
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
