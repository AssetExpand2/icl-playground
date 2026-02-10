import { useState, useCallback, useRef } from 'react';
import {
  initWasm,
  isInitialized,
  parseContract,
  normalize,
  verify,
  semanticHash,
} from '../icl/runtime';

// --- Types ---

export type PipelineStage = 'source' | 'parse' | 'normalize' | 'verify' | 'hash';

export interface StageResult {
  stage: PipelineStage;
  status: 'pending' | 'running' | 'success' | 'error';
  output?: string;
  error?: string;
  durationMs?: number;
}

const STAGE_ORDER: PipelineStage[] = ['source', 'parse', 'normalize', 'verify', 'hash'];

// --- Hook ---

export function usePipeline() {
  const [stages, setStages] = useState<StageResult[]>(buildInitialStages());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const sourceRef = useRef('');

  /** Reset pipeline with new source code */
  const reset = useCallback((source: string) => {
    sourceRef.current = source;
    setCurrentIndex(0);
    setRunning(false);
    setStages([
      { stage: 'source', status: 'success', output: source },
      { stage: 'parse', status: 'pending' },
      { stage: 'normalize', status: 'pending' },
      { stage: 'verify', status: 'pending' },
      { stage: 'hash', status: 'pending' },
    ]);
  }, []);

  /** Run the next pending stage */
  const stepNext = useCallback(async () => {
    if (running) return;

    // Find the next pending stage
    const nextIdx = currentIndex === 0 ? 1 : currentIndex + 1;
    if (nextIdx >= STAGE_ORDER.length) return;

    const stage = STAGE_ORDER[nextIdx];
    setRunning(true);

    // Mark as running
    setStages((prev) => {
      const next = [...prev];
      next[nextIdx] = { ...next[nextIdx], status: 'running' };
      return next;
    });

    const start = performance.now();

    try {
      if (!isInitialized()) {
        await initWasm();
      }

      let output: string;
      const source = sourceRef.current;

      switch (stage) {
        case 'parse':
          output = parseContract(source);
          break;
        case 'normalize':
          output = normalize(source);
          break;
        case 'verify':
          output = verify(source);
          break;
        case 'hash':
          output = semanticHash(source);
          break;
        default:
          output = '';
      }

      const durationMs = performance.now() - start;

      setStages((prev) => {
        const next = [...prev];
        next[nextIdx] = { stage, status: 'success', output, durationMs };
        return next;
      });
      setCurrentIndex(nextIdx);
    } catch (err) {
      const durationMs = performance.now() - start;
      setStages((prev) => {
        const next = [...prev];
        next[nextIdx] = {
          stage,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
          durationMs,
        };
        return next;
      });
      setCurrentIndex(nextIdx);
    } finally {
      setRunning(false);
    }
  }, [currentIndex, running]);

  /** Run all remaining stages */
  const runAll = useCallback(async () => {
    if (running) return;

    let idx = currentIndex === 0 ? 1 : currentIndex + 1;
    while (idx < STAGE_ORDER.length) {
      const stage = STAGE_ORDER[idx];
      setRunning(true);

      setStages((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], status: 'running' };
        return next;
      });

      const start = performance.now();

      try {
        if (!isInitialized()) {
          await initWasm();
        }

        let output: string;
        const source = sourceRef.current;

        switch (stage) {
          case 'parse':
            output = parseContract(source);
            break;
          case 'normalize':
            output = normalize(source);
            break;
          case 'verify':
            output = verify(source);
            break;
          case 'hash':
            output = semanticHash(source);
            break;
          default:
            output = '';
        }

        const durationMs = performance.now() - start;
        setStages((prev) => {
          const next = [...prev];
          next[idx] = { stage, status: 'success', output, durationMs };
          return next;
        });
        setCurrentIndex(idx);
      } catch (err) {
        const durationMs = performance.now() - start;
        setStages((prev) => {
          const next = [...prev];
          next[idx] = {
            stage,
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
            durationMs,
          };
          return next;
        });
        setCurrentIndex(idx);
        break; // Stop on error
      } finally {
        setRunning(false);
      }

      idx++;
    }
  }, [currentIndex, running]);

  const isComplete = currentIndex >= STAGE_ORDER.length - 1;
  const hasError = stages.some((s) => s.status === 'error');

  return { stages, currentIndex, running, isComplete, hasError, reset, stepNext, runAll };
}

function buildInitialStages(): StageResult[] {
  return STAGE_ORDER.map((stage) => ({ stage, status: 'pending' as const }));
}
