/**
 * Generate JSON input templates from parsed ICL contract AST.
 *
 * Extracts operation names and parameters from BehavioralSemantics,
 * then produces ready-to-use JSON templates for the Execute panel.
 */

import { parseContract, initWasm, isInitialized } from './runtime';

// --- Types ---

export interface OperationInfo {
  name: string;
  parameters: Record<string, string>; // param name → type string
}

export type TemplateResult =
  | { success: true; operations: OperationInfo[] }
  | { success: false; error: string };

// --- Type → placeholder mapping ---

const TYPE_PLACEHOLDERS: Record<string, unknown> = {
  String: '<String>',
  Integer: 0,
  Float: 0.0,
  Boolean: false,
  ISO8601: '2026-01-01T00:00:00Z',
  Uuid: '00000000-0000-0000-0000-000000000000',
  UUID: '00000000-0000-0000-0000-000000000000',
  Array: [],
  Map: {},
  Object: {},
};

function placeholderForType(typeStr: string): unknown {
  // Handle exact match
  if (typeStr in TYPE_PLACEHOLDERS) return TYPE_PLACEHOLDERS[typeStr];

  // Handle quoted type like "String" → String
  const unquoted = typeStr.replace(/^"|"$/g, '');
  if (unquoted in TYPE_PLACEHOLDERS) return TYPE_PLACEHOLDERS[unquoted];

  // Default: string placeholder
  return `<${typeStr}>`;
}

// --- Core ---

/**
 * Parse the contract source and extract operations with their parameters.
 */
export async function extractOperations(source: string): Promise<TemplateResult> {
  try {
    if (!isInitialized()) {
      await initWasm();
    }

    const jsonStr = parseContract(source);
    const contract = JSON.parse(jsonStr);

    // Navigate to behavioral_semantics.operations
    const ops = contract?.behavioral_semantics?.operations;
    if (!ops || !Array.isArray(ops) || ops.length === 0) {
      return {
        success: false,
        error: 'No operations found in BehavioralSemantics',
      };
    }

    const operations: OperationInfo[] = ops.map((op: { name?: string; parameters?: Record<string, string> }) => ({
      name: op.name ?? 'unknown',
      parameters: typeof op.parameters === 'object' && op.parameters !== null
        ? op.parameters as Record<string, string>
        : {},
    }));

    return { success: true, operations };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Generate a JSON input template string for a specific operation.
 */
export function generateTemplate(op: OperationInfo): string {
  const inputs: Record<string, unknown> = {};
  for (const [param, type] of Object.entries(op.parameters)) {
    inputs[param] = placeholderForType(type);
  }

  return JSON.stringify(
    {
      operation: op.name,
      inputs,
    },
    null,
    2,
  );
}
