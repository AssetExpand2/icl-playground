import { useEffect } from 'react';
import { usePipeline } from '../hooks/usePipeline';
import type { StageResult, PipelineStage } from '../hooks/usePipeline';
import { CopyButton } from './CopyButton';

// --- Stage Display Config ---

interface StageConfig {
  label: string;
  icon: string;
}

const STAGE_CONFIG: Record<PipelineStage, StageConfig> = {
  source:    { label: 'Source',    icon: '📝' },
  parse:     { label: 'Parse',     icon: '{ }' },
  normalize: { label: 'Normalize', icon: '≡' },
  verify:    { label: 'Verify',    icon: '✓' },
  hash:      { label: 'Hash',      icon: '#' },
};

// --- Component ---

interface PipelineViewProps {
  source: string;
}

export function PipelineView({ source }: PipelineViewProps) {
  const { stages, running, isComplete, hasError, reset, stepNext, runAll } = usePipeline();

  // Reset pipeline when source changes
  useEffect(() => {
    reset(source);
  }, [source, reset]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800 bg-gray-900/80">
        <button
          onClick={stepNext}
          disabled={running || isComplete || hasError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
            bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          <span>▶</span>
          <span>Step Next</span>
        </button>

        <button
          onClick={runAll}
          disabled={running || isComplete || hasError}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
            bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          <span>⏩</span>
          <span>Run All</span>
        </button>

        <button
          onClick={() => reset(source)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
            bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300
            transition-colors ml-auto"
        >
          <span>↺</span>
          <span>Reset</span>
        </button>
      </div>

      {/* Pipeline stages */}
      <div className="flex-1 overflow-auto p-4">
        {/* Visual pipeline flow */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {stages.map((stage, i) => (
            <div key={stage.stage} className="flex items-center">
              {i > 0 && (
                <svg className="w-5 h-5 text-gray-700 shrink-0 mx-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5l8 7-8 7z" />
                </svg>
              )}
              <StageChip stage={stage} />
            </div>
          ))}
        </div>

        {/* Stage outputs */}
        <div className="space-y-3">
          {stages.map((stage) => (
            <StageOutput key={stage.stage} stage={stage} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Stage Chip (in the flow bar) ---

function StageChip({ stage }: { stage: StageResult }) {
  const config = STAGE_CONFIG[stage.stage];

  const bgColor =
    stage.status === 'success'
      ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800 text-green-800 dark:text-green-300'
      : stage.status === 'error'
        ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-800 dark:text-red-300'
        : stage.status === 'running'
          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-800 text-blue-800 dark:text-blue-300 animate-pulse'
          : 'bg-gray-800/50 border-gray-700 text-gray-500';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0 ${bgColor}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {stage.durationMs !== undefined && (
        <span className="text-gray-600 ml-0.5">{stage.durationMs.toFixed(1)}ms</span>
      )}
    </div>
  );
}

// --- Stage Output Card ---

function StageOutput({ stage }: { stage: StageResult }) {
  const config = STAGE_CONFIG[stage.stage];

  if (stage.status === 'pending') return null;

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className={`px-3 py-2 flex items-center gap-2 text-sm font-medium ${
        stage.status === 'success'
          ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400'
          : stage.status === 'error'
            ? 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400'
            : stage.status === 'running'
              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400'
              : 'bg-gray-900 text-gray-500'
      }`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {stage.durationMs !== undefined && (
          <span className="text-gray-600 text-xs ml-auto">{stage.durationMs.toFixed(1)}ms</span>
        )}
        {stage.status === 'running' && (
          <span className="ml-auto text-xs">Running...</span>
        )}
      </div>

      {/* Body */}
      {stage.status === 'error' && stage.error && (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <CopyButton text={stage.error} />
          </div>
          <pre className="p-3 text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap bg-red-50 dark:bg-gray-950/50 max-h-40 overflow-auto pr-12">
            {stage.error}
          </pre>
        </div>
      )}

      {stage.status === 'success' && stage.output && (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <CopyButton text={formatStageOutput(stage.output)} />
          </div>
          <pre className="p-3 text-xs text-gray-700 dark:text-gray-400 font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-950/50 max-h-40 overflow-auto pr-12">
            {formatStageOutput(stage.output)}
          </pre>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---

function formatStageOutput(output: string): string {
  try {
    const parsed = JSON.parse(output);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Truncate very long outputs
    return output.length > 500 ? output.slice(0, 497) + '...' : output;
  }
}
