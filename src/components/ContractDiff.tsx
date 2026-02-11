import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../hooks/useTheme';
import {
  initWasm,
  isInitialized,
  normalize,
} from '../icl/runtime';

// --- Diff Algorithm (simple line-based) ---

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
  lineNumber: number;
}

function computeLineDiff(leftLines: string[], rightLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const m = leftLines.length;
  const n = rightLines.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  let i = m, j = n;
  const stack: DiffLine[] = [];
  let lineNum = Math.max(m, n);

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      stack.push({ type: 'same', text: leftLines[i - 1], lineNumber: lineNum-- });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', text: rightLines[j - 1], lineNumber: lineNum-- });
      j--;
    } else {
      stack.push({ type: 'removed', text: leftLines[i - 1], lineNumber: lineNum-- });
      i--;
      lineNum++;
    }
  }

  // Reverse to get correct order and re-number
  stack.reverse();
  let num = 1;
  for (const line of stack) {
    line.lineNumber = num++;
    result.push(line);
  }

  return result;
}

// --- Component ---

interface ContractDiffProps {
  initialLeft: string;
}

export function ContractDiff({ initialLeft }: ContractDiffProps) {
  const { theme } = useTheme();
  const [leftSource, setLeftSource] = useState(initialLeft);
  const [rightSource, setRightSource] = useState('');
  const [diffLines, setDiffLines] = useState<DiffLine[] | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ added: number; removed: number; same: number } | null>(null);

  const runDiff = useCallback(async () => {
    if (running) return;
    if (!leftSource.trim() || !rightSource.trim()) {
      setError('Both contracts must have content');
      return;
    }

    setRunning(true);
    setError(null);
    setDiffLines(null);

    try {
      if (!isInitialized()) {
        await initWasm();
      }

      // Normalize both contracts
      const leftNorm = normalize(leftSource);
      const rightNorm = normalize(rightSource);

      // Compute line diff on normalized forms
      const leftLines = leftNorm.split('\n');
      const rightLines = rightNorm.split('\n');
      const diff = computeLineDiff(leftLines, rightLines);

      setDiffLines(diff);
      setStats({
        added: diff.filter((l) => l.type === 'added').length,
        removed: diff.filter((l) => l.type === 'removed').length,
        same: diff.filter((l) => l.type === 'same').length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [leftSource, rightSource, running]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800 bg-gray-900/80">
        <button
          onClick={runDiff}
          disabled={running || !leftSource.trim() || !rightSource.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
            bg-blue-600 text-white border border-blue-500 hover:bg-blue-500 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors active:scale-[0.97]"
        >
          {running ? (
            <span>Diffing...</span>
          ) : (
            <>
              <span>⇔</span>
              <span>Diff (Normalized)</span>
            </>
          )}
        </button>

        {stats && (
          <div className="flex items-center gap-3 text-xs ml-auto">
            <span className="text-green-400">+{stats.added} added</span>
            <span className="text-red-400">-{stats.removed} removed</span>
            <span className="text-gray-500">{stats.same} unchanged</span>
          </div>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-950/30 border-b border-red-900/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Contextual hint — shown when no diff has been run */}
      {!stats && !error && (
        <div className="px-3 py-2 bg-blue-950/20 border-b border-blue-900/20">
          <p className="text-xs text-blue-400/80">
            <strong>Normalization-based diff:</strong> Both contracts are normalized to canonical form before comparison, so superficial
            differences (whitespace, key order) are ignored — only semantic changes are shown.
          </p>
        </div>
      )}

      {/* Side-by-side editors */}
      <div className="flex flex-1 min-h-0">
        {/* Left editor */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-gray-800">
          <div className="px-3 py-1.5 bg-gray-900/60 border-b border-gray-800 text-xs text-gray-500">
            Contract A (left)
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              language="icl"
              value={leftSource}
              onChange={(v) => setLeftSource(v ?? '')}
              theme={theme === 'dark' ? 'icl-dark' : 'icl-light'}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right editor */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 py-1.5 bg-gray-900/60 border-b border-gray-800 text-xs text-gray-500">
            Contract B (right)
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              language="icl"
              value={rightSource}
              onChange={(v) => setRightSource(v ?? '')}
              theme={theme === 'dark' ? 'icl-dark' : 'icl-light'}
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* Diff output */}
      {diffLines && (
        <div className="border-t border-gray-800 max-h-60 overflow-auto bg-gray-950">
          <div className="px-3 py-1.5 bg-gray-900/60 border-b border-gray-800 text-xs text-gray-500 sticky top-0">
            Semantic Diff (normalized form)
          </div>
          <div className="font-mono text-xs">
            {diffLines.map((line, i) => (
              <div
                key={i}
                className={`px-3 py-0.5 flex ${
                  line.type === 'added'
                    ? 'bg-green-950/30 text-green-400'
                    : line.type === 'removed'
                      ? 'bg-red-950/30 text-red-400'
                      : 'text-gray-500'
                }`}
              >
                <span className="w-6 text-right mr-3 text-gray-700 select-none shrink-0">
                  {line.lineNumber}
                </span>
                <span className="w-4 shrink-0 select-none">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
