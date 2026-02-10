import { useState, useCallback, useRef } from 'react';
import {
  initWasm,
  isInitialized,
  parseContract,
  normalize,
  verify,
  semanticHash,
  execute,
} from '../icl/runtime';
import type { IclResult, PipelineAction } from '../icl/types';

/**
 * Hook for ICL runtime operations.
 * Handles WASM initialization and wraps all ICL functions with
 * error handling, timing, and loading state.
 */
export function useIcl() {
  const [loading, setLoading] = useState(false);
  const [wasmReady, setWasmReady] = useState(isInitialized());
  const [result, setResult] = useState<IclResult | null>(null);
  const initPromise = useRef<Promise<void> | null>(null);

  /** Initialize WASM. Safe to call multiple times. */
  const init = useCallback(async () => {
    if (isInitialized()) {
      setWasmReady(true);
      return;
    }
    // Deduplicate concurrent init calls
    if (!initPromise.current) {
      initPromise.current = initWasm();
    }
    await initPromise.current;
    setWasmReady(true);
  }, []);

  /** Run an ICL action and capture the result. */
  const run = useCallback(
    async (action: PipelineAction, source: string, inputs?: string) => {
      setLoading(true);
      const start = performance.now();

      try {
        if (!isInitialized()) {
          await init();
        }

        let output: string;
        switch (action) {
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
          case 'execute':
            output = execute(source, inputs ?? '{}');
            break;
        }

        const res: IclResult = {
          action,
          success: true,
          output,
          durationMs: performance.now() - start,
        };
        setResult(res);
        return res;
      } catch (err) {
        const res: IclResult = {
          action,
          success: false,
          output: '',
          error: err instanceof Error ? err.message : String(err),
          durationMs: performance.now() - start,
        };
        setResult(res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [init],
  );

  return { wasmReady, loading, result, init, run };
}
