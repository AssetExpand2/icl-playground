/**
 * Browser-compatible wrapper around the icl-runtime WASM module.
 *
 * The npm `icl-runtime` package is built for Node.js (uses `require('fs')`),
 * so we load the WASM binary directly via fetch and replicate the glue code
 * for browser use.
 */

// --- WASM instance and helpers (populated after init) ---

/** Type-safe interface for the ICL WASM exports */
interface IclWasmExports {
  memory: WebAssembly.Memory;
  __wbindgen_externrefs: WebAssembly.Table;
  __wbindgen_malloc: (size: number, align: number) => number;
  __wbindgen_realloc: (ptr: number, oldSize: number, newSize: number, align: number) => number;
  __wbindgen_free: (ptr: number, size: number, align: number) => void;
  __wbindgen_start: () => void;
  __externref_table_dealloc: (idx: number) => void;
  parseContract: (ptr: number, len: number) => number[];
  normalize: (ptr: number, len: number) => number[];
  verify: (ptr: number, len: number) => number[];
  semanticHash: (ptr: number, len: number) => number[];
  execute: (ptr0: number, len0: number, ptr1: number, len1: number) => number[];
}

let wasm: IclWasmExports;
let initialized = false;

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
const cachedTextEncoder = new TextEncoder();

let cachedUint8ArrayMemory: Uint8Array | null = null;
let WASM_VECTOR_LEN = 0;

function getUint8ArrayMemory(): Uint8Array {
  if (cachedUint8ArrayMemory === null || cachedUint8ArrayMemory.byteLength === 0) {
    cachedUint8ArrayMemory = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory;
}

function getStringFromWasm(ptr: number, len: number): string {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8ArrayMemory().subarray(ptr, ptr + len));
}

function passStringToWasm(arg: string, malloc: CallableFunction, realloc?: CallableFunction): number {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = (malloc(buf.length, 1) as number) >>> 0;
    getUint8ArrayMemory().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = (malloc(len, 1) as number) >>> 0;

  const mem = getUint8ArrayMemory();
  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = (realloc(ptr, len, (len = offset + arg.length * 3), 1) as number) >>> 0;
    const view = getUint8ArrayMemory().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written!;
    ptr = (realloc(ptr, len, offset, 1) as number) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function takeFromExternrefTable(idx: number): unknown {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}

function getImports(): WebAssembly.Imports {
  const import0 = {
    __proto__: null,
    __wbg_Error_8c4e43fe74559d73: function (arg0: number, arg1: number) {
      return Error(getStringFromWasm(arg0, arg1));
    },
    __wbindgen_init_externref_table: function () {
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, undefined);
      table.set(offset + 0, undefined);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
    },
  };
  return {
    './icl_runtime_bg.js': import0,
  } as unknown as WebAssembly.Imports;
}

// --- Public API ---

/**
 * Initialize the WASM module. Must be called once before using any ICL functions.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initWasm(): Promise<void> {
  if (initialized) return;

  const wasmUrl = `${import.meta.env.BASE_URL}icl_runtime_bg.wasm`;
  const response = await fetch(wasmUrl);
  const wasmBytes = await response.arrayBuffer();
  const wasmModule = new WebAssembly.Module(wasmBytes);
  const imports = getImports();

  const instance = new WebAssembly.Instance(wasmModule, imports);
  wasm = instance.exports as unknown as IclWasmExports;

  // Reset memory cache after loading
  cachedUint8ArrayMemory = null;

  // Initialize the externref table
  wasm.__wbindgen_start();
  initialized = true;
}

/** Returns true if the WASM module has been initialized. */
export function isInitialized(): boolean {
  return initialized;
}

function ensureInit(): void {
  if (!initialized) {
    throw new Error('ICL WASM not initialized. Call initWasm() first.');
  }
}

/** Helper to call a WASM function that takes one string and returns one string. */
function callStringToString(wasmFn: CallableFunction, text: string): string {
  ensureInit();
  let deferredPtr = 0;
  let deferredLen = 0;
  try {
    const ptr0 = passStringToWasm(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasmFn(ptr0, len0) as number[];
    const ptr1 = ret[0];
    const len1 = ret[1];
    if (ret[3]) {
      throw takeFromExternrefTable(ret[2]);
    }
    deferredPtr = ptr1;
    deferredLen = len1;
    return getStringFromWasm(ptr1, len1);
  } finally {
    if (deferredPtr !== 0) {
      wasm.__wbindgen_free(deferredPtr, deferredLen, 1);
    }
  }
}

/**
 * Parse ICL contract text and return the AST as a JSON string.
 * @throws Error if the contract has syntax or semantic errors
 */
export function parseContract(text: string): string {
  return callStringToString(wasm.parseContract, text);
}

/**
 * Normalize ICL contract text to canonical form.
 * Deterministic and idempotent.
 * @throws Error if the contract cannot be parsed
 */
export function normalize(text: string): string {
  return callStringToString(wasm.normalize, text);
}

/**
 * Verify an ICL contract for correctness.
 * Returns JSON: { valid: boolean, errors: [...], warnings: [...] }
 * @throws Error if the contract cannot be parsed
 */
export function verify(text: string): string {
  return callStringToString(wasm.verify, text);
}

/**
 * Compute the SHA-256 semantic hash of a contract.
 * @throws Error if the contract cannot be parsed
 */
export function semanticHash(text: string): string {
  return callStringToString(wasm.semanticHash, text);
}

/**
 * Execute an ICL contract with the given inputs.
 * @param text - ICL contract source text
 * @param inputs - JSON string with execution inputs
 * @returns JSON string with execution result including provenance log
 * @throws Error if the contract cannot be parsed, verified, or executed
 */
export function execute(text: string, inputs: string): string {
  ensureInit();
  let deferredPtr = 0;
  let deferredLen = 0;
  try {
    const ptr0 = passStringToWasm(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm(inputs, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.execute(ptr0, len0, ptr1, len1) as number[];
    const ptr2 = ret[0];
    const len2 = ret[1];
    if (ret[3]) {
      throw takeFromExternrefTable(ret[2]);
    }
    deferredPtr = ptr2;
    deferredLen = len2;
    return getStringFromWasm(ptr2, len2);
  } finally {
    if (deferredPtr !== 0) {
      wasm.__wbindgen_free(deferredPtr, deferredLen, 1);
    }
  }
}
