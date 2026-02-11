/**
 * ICL Runtime wrapper.
 *
 * Re-exports from the `icl-runtime` npm package (bundler target).
 * Vite handles the WASM loading via vite-plugin-wasm + vite-plugin-top-level-await.
 *
 * With the bundler target, all functions are synchronous and ready on import —
 * no manual WASM fetching or glue code needed.
 */

import {
  parseContract as _parseContract,
  normalize as _normalize,
  verify as _verify,
  semanticHash as _semanticHash,
  execute as _execute,
} from 'icl-runtime'

// The bundler target initializes synchronously on import (top-level await handles it).
// We keep the initWasm/isInitialized API so downstream code (useIcl, templateGenerator) is unchanged.
let initialized = false

/**
 * Initialize the WASM module. With the bundler target this is effectively a no-op
 * since the module is initialized on import, but we keep the API for compatibility.
 */
export async function initWasm(): Promise<void> {
  // The bundler target auto-initializes. Just mark ready.
  initialized = true
}

/** Returns true if initWasm() has been called. */
export function isInitialized(): boolean {
  return initialized
}

/**
 * Parse ICL contract text and return the AST as a JSON string.
 * @throws Error if the contract has syntax or semantic errors
 */
export function parseContract(text: string): string {
  return _parseContract(text)
}

/**
 * Normalize ICL contract text to canonical form.
 * @throws Error if the contract cannot be parsed
 */
export function normalize(text: string): string {
  return _normalize(text)
}

/**
 * Verify an ICL contract for correctness.
 * Returns JSON: { valid: boolean, errors: [...], warnings: [...] }
 * @throws Error if the contract cannot be parsed
 */
export function verify(text: string): string {
  return _verify(text)
}

/**
 * Compute the SHA-256 semantic hash of a contract.
 * @throws Error if the contract cannot be parsed
 */
export function semanticHash(text: string): string {
  return _semanticHash(text)
}

/**
 * Execute an ICL contract with the given inputs.
 * @param text - ICL contract source text
 * @param inputs - JSON string with execution inputs
 * @returns JSON string with execution result including provenance log
 * @throws Error if the contract cannot be parsed, verified, or executed
 */
export function execute(text: string, inputs: string): string {
  return _execute(text, inputs)
}
