import { useState, useCallback } from 'react';
import {
  initWasm,
  isInitialized,
  semanticHash,
} from '../icl/runtime';

// --- Types ---

interface DeterminismResult {
  iterations: number;
  hashes: string[];
  allIdentical: boolean;
  totalMs: number;
  avgMs: number;
}

// --- Component ---

interface DeterminismCheckProps {
  source: string;
}

export function DeterminismCheck({ source }: DeterminismCheckProps) {
  const [iterCount, setIterCount] = useState(10);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DeterminismResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    if (running || !source.trim()) return;
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      if (!isInitialized()) {
        await initWasm();
      }

      const hashes: string[] = [];
      const start = performance.now();

      for (let i = 0; i < iterCount; i++) {
        const hash = semanticHash(source);
        hashes.push(hash);
      }

      const totalMs = performance.now() - start;
      const uniqueHashes = new Set(hashes);

      setResult({
        iterations: iterCount,
        hashes,
        allIdentical: uniqueHashes.size === 1,
        totalMs,
        avgMs: totalMs / iterCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [source, iterCount, running]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-800 bg-gray-900/80">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <span>Iterations:</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={iterCount}
            onChange={(e) => setIterCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 10)))}
            className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-200
              focus:outline-none focus:border-blue-500"
          />
        </label>

        <button
          onClick={runCheck}
          disabled={running || !source.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
            bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {running ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Running...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Run Determinism Check</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="p-3 rounded bg-red-950/30 border border-red-900/30 mb-4">
            <p className="text-sm text-red-400 font-mono">{error}</p>
          </div>
        )}

        {!result && !error && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <span className="text-3xl mb-3">🔄</span>
            <p className="text-sm">Hash the same contract N times and verify all results are identical</p>
            <p className="text-xs text-gray-700 mt-1">This proves the ICL pipeline is deterministic</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Verdict */}
            <div className={`p-4 rounded-lg border ${
              result.allIdentical
                ? 'bg-green-950/20 border-green-800'
                : 'bg-red-950/20 border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {result.allIdentical ? '✅' : '❌'}
                </span>
                <div>
                  <p className={`text-lg font-bold ${
                    result.allIdentical ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.allIdentical ? 'DETERMINISTIC' : 'NON-DETERMINISTIC'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {result.iterations} iterations — all hashes{' '}
                    {result.allIdentical ? 'identical' : 'NOT identical'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Iterations" value={String(result.iterations)} />
              <StatCard label="Total Time" value={`${result.totalMs.toFixed(1)}ms`} />
              <StatCard label="Avg/Iteration" value={`${result.avgMs.toFixed(2)}ms`} />
            </div>

            {/* Hash value */}
            <div className="p-3 rounded bg-gray-800/50">
              <p className="text-xs text-gray-500 mb-1.5">Hash value (first result):</p>
              <p className="text-sm font-mono text-gray-300 break-all">
                {result.hashes[0]}
              </p>
            </div>

            {/* Unique hashes (only show if mismatch) */}
            {!result.allIdentical && (
              <div className="p-3 rounded bg-red-950/20 border border-red-900/30">
                <p className="text-xs text-red-500 mb-1.5">
                  Unique hashes ({new Set(result.hashes).size}):
                </p>
                {[...new Set(result.hashes)].map((h, i) => (
                  <p key={i} className="text-xs font-mono text-red-300 break-all">
                    {h}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper ---

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded bg-gray-800/50 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-200 mt-0.5">{value}</p>
    </div>
  );
}
