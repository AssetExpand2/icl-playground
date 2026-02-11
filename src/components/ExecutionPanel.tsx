import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import {
  initWasm,
  isInitialized,
  execute,
} from '../icl/runtime';
import { CopyButton } from './CopyButton';

// --- Types ---

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
}

// --- Component ---

interface ExecutionPanelProps {
  source: string;
}

export function ExecutionPanel({ source }: ExecutionPanelProps) {
  const { theme } = useTheme();
  const [inputJson, setInputJson] = useState(
    '{\n  "operation": "echo",\n  "inputs": {\n    "message": "Hello, ICL!"\n  }\n}'
  );
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleExecute = useCallback(async () => {
    if (running || !source.trim()) return;

    setRunning(true);
    setResult(null);

    const start = performance.now();

    try {
      // Validate JSON input
      try {
        JSON.parse(inputJson);
      } catch {
        setResult({
          success: false,
          output: '',
          error: 'Invalid JSON input — please check your input parameters',
          durationMs: performance.now() - start,
        });
        return;
      }

      if (!isInitialized()) {
        await initWasm();
      }

      const output = execute(source, inputJson);
      setResult({
        success: true,
        output,
        durationMs: performance.now() - start,
      });
    } catch (err) {
      setResult({
        success: false,
        output: '',
        error: err instanceof Error ? err.message : String(err),
        durationMs: performance.now() - start,
      });
    } finally {
      setRunning(false);
    }
  }, [source, inputJson, running]);

  // Try to pretty-print the output
  const formattedOutput = (() => {
    if (!result?.output) return null;
    try {
      return JSON.stringify(JSON.parse(result.output), null, 2);
    } catch {
      return result.output;
    }
  })();

  // Try to extract structured sections from execution output
  const sections = (() => {
    if (!result?.output) return null;
    try {
      const parsed = JSON.parse(result.output);
      return {
        result: parsed.result ?? parsed.output ?? null,
        postconditions: parsed.postconditions ?? parsed.postcondition_results ?? null,
        provenance: parsed.provenance ?? parsed.provenance_log ?? null,
        raw: parsed,
      };
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800 bg-gray-900/80">
        <button
          onClick={handleExecute}
          disabled={running || !source.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
            bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500 hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors active:scale-[0.97]"
        >
          {running ? (
            <span className="flex items-center gap-1.5">
              <span className="animate-spin">⟳</span>
              Executing...
            </span>
          ) : (
            <>
              <span>▶</span>
              <span>Execute</span>
            </>
          )}
        </button>

        {result && (
          <span className="text-xs text-gray-500 ml-auto">
            {result.durationMs.toFixed(1)}ms
          </span>
        )}
      </div>

      {/* Input + Output layout */}
      <div className="flex flex-1 min-h-0 flex-col">
        {/* Input JSON editor */}
        <div className="flex flex-col border-b border-gray-800" style={{ height: '35%', minHeight: 80 }}>
          <div className="px-3 py-1.5 bg-gray-900/60 border-b border-gray-800 text-xs text-gray-500 flex items-center gap-2">
            <span>Input JSON</span>
            <span className="text-gray-700">—</span>
            <span className="text-gray-600">
              Format: <code className="text-gray-400">{"{"}"operation": "name", "inputs": {"{"} ... {"}"}{"}"}
              </code>
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              language="json"
              value={inputJson}
              onChange={(v) => setInputJson(v ?? '{}')}
              theme={theme === 'dark' ? 'icl-dark' : 'icl-light'}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
                folding: true,
              }}
            />
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 min-h-0 overflow-auto">
          {!result ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <span className="text-2xl mb-2">▶</span>
              <p className="text-sm">Set "operation" to match a BehavioralSemantics operation name, then click Execute</p>
            </div>
          ) : result.error ? (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-400">Execution Failed</span>
              </div>
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <CopyButton text={result.error} />
                </div>
                <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono bg-red-950/30 rounded p-3 pr-20">
                  {result.error}
                </pre>
              </div>

              {/* Help: what to do */}
              <div className="mt-4 rounded border border-amber-800/40 bg-amber-950/20 p-3">
                <p className="text-xs font-semibold text-amber-400 mb-1.5">How to fix this</p>
                <p className="text-xs text-gray-400 mb-2">
                  Make sure your input JSON has an <code className="text-amber-300 bg-gray-800/50 px-1 rounded">"operation"</code> field
                  matching a name from the contract's <strong className="text-gray-300">BehavioralSemantics → operations</strong>,
                  and an <code className="text-amber-300 bg-gray-800/50 px-1 rounded">"inputs"</code> object with the required parameters.
                </p>
                <div className="bg-gray-900/80 rounded p-2 border border-gray-700">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Example</p>
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre">{`{
  "operation": "echo",
  "inputs": {
    "message": "Hello, ICL!"
  }
}`}</pre>
                </div>
              </div>
            </div>
          ) : sections ? (
            <div className="p-4 space-y-4">
              {/* Success header */}
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-400">Execution Succeeded</span>
              </div>

              {/* Result section */}
              {sections.result != null && (
                <OutputSection title="Result" color="green">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {typeof sections.result === 'string'
                      ? sections.result
                      : JSON.stringify(sections.result, null, 2)}
                  </pre>
                </OutputSection>
              )}

              {/* Postconditions */}
              {sections.postconditions != null && (
                <OutputSection title="Postcondition Checks" color="blue">
                  {Array.isArray(sections.postconditions) ? (
                    <div className="space-y-1">
                      {sections.postconditions.map((pc: { name?: string; passed?: boolean; message?: string }, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-mono">
                          <span className={pc.passed ? 'text-green-400' : 'text-red-400'}>
                            {pc.passed ? '✓' : '✕'}
                          </span>
                          <span className="text-gray-300">
                            {pc.name ?? pc.message ?? JSON.stringify(pc)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                      {JSON.stringify(sections.postconditions, null, 2)}
                    </pre>
                  )}
                </OutputSection>
              )}

              {/* Provenance log */}
              {sections.provenance != null && (
                <OutputSection title="Provenance Log" color="purple">
                  {Array.isArray(sections.provenance) ? (
                    <div className="space-y-1 text-sm font-mono">
                      {sections.provenance.map((entry: unknown, i: number) => (
                        <div key={i} className="text-gray-400 border-l-2 border-purple-800 pl-2">
                          {typeof entry === 'string' ? entry : JSON.stringify(entry)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                      {JSON.stringify(sections.provenance, null, 2)}
                    </pre>
                  )}
                </OutputSection>
              )}

              {/* Full raw output if no structured sections were found */}
              {!sections.result && !sections.postconditions && !sections.provenance && (
                <OutputSection title="Output" color="gray">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {formattedOutput}
                  </pre>
                </OutputSection>
              )}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-400">Execution Succeeded</span>
              </div>
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <CopyButton text={formattedOutput ?? ''} />
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800/50 rounded p-3 pr-20">
                  {formattedOutput ?? '(no output)'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---

const SECTION_COLORS: Record<string, string> = {
  green: 'border-green-800 bg-green-950/20',
  blue: 'border-blue-800 bg-blue-950/20',
  purple: 'border-purple-800 bg-purple-950/20',
  gray: 'border-gray-700 bg-gray-800/30',
};

function OutputSection({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const cls = SECTION_COLORS[color] ?? SECTION_COLORS.gray;
  return (
    <div className={`rounded border ${cls} p-3`}>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}
