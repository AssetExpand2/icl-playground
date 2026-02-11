/**
 * TypeScript types for ICL AST nodes.
 * These mirror the JSON structure returned by parseContract().
 */

// --- Verification Result ---

export interface VerificationError {
  message: string;
  location?: { line: number; column: number };
}

export interface VerificationResult {
  valid: boolean;
  errors: VerificationError[];
  warnings: VerificationError[];
}

// --- Execution Result ---

export interface ProvenanceEntry {
  operation: string;
  timestamp: string;
  input_hash: string;
  output_hash: string;
  state_before: string;
  state_after: string;
}

export interface ExecutionResult {
  success: boolean;
  output: Record<string, unknown>;
  state: Record<string, unknown>;
  provenance: ProvenanceEntry[];
  error?: string;
}

// --- Pipeline Result (used by useIcl hook) ---

export type PipelineAction =
  | 'parse'
  | 'normalize'
  | 'verify'
  | 'hash'
  | 'execute';

export interface IclResult {
  action: PipelineAction;
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
}

// --- Example Contract ---

export interface ExampleContract {
  name: string;
  filename: string;
  description: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export const EXAMPLE_CONTRACTS: ExampleContract[] = [
  {
    name: 'Hello World',
    filename: 'hello-world.icl',
    description: 'Simplest valid ICL contract — echoes input messages',
    complexity: 'beginner',
  },
  {
    name: 'DB Write Validation',
    filename: 'db-write-validation.icl',
    description: 'Validates database writes before execution',
    complexity: 'intermediate',
  },
  {
    name: 'API Rate Limiting',
    filename: 'api-rate-limiting.icl',
    description: 'Enforces rate limits on API endpoints',
    complexity: 'intermediate',
  },
  {
    name: 'Data Governance',
    filename: 'data-governance.icl',
    description: 'GDPR-style data retention and consent management',
    complexity: 'advanced',
  },
  {
    name: 'IoT Device Policy',
    filename: 'iot-device-policy.icl',
    description: 'Sensor reading thresholds and automated alerts',
    complexity: 'intermediate',
  },
  {
    name: 'Access Control',
    filename: 'access-control.icl',
    description: 'Role-based permission grants and audit logging',
    complexity: 'advanced',
  },
];
