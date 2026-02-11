import type { PipelineAction } from '../icl/types';

// --- Action Definitions ---

interface ActionDef {
  action: PipelineAction | 'format';
  label: string;
  shortcut: string;
  icon: string;
  available: boolean;
}

const ACTIONS: ActionDef[] = [
  { action: 'parse', label: 'Parse', shortcut: '⌘1', icon: '{ }', available: true },
  { action: 'normalize', label: 'Normalize', shortcut: '⌘2', icon: '≡', available: true },
  { action: 'verify', label: 'Verify', shortcut: '⌘3', icon: '✓', available: true },
  { action: 'hash', label: 'Hash', shortcut: '⌘4', icon: '#', available: true },
  { action: 'execute', label: 'Execute', shortcut: '⌘5', icon: '▶', available: true },
  { action: 'format', label: 'Format', shortcut: '⌘F', icon: '⎘', available: false },
];

// --- Spinner ---

function Spinner() {
  return (
    <svg
      className="animate-spin h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// --- Component ---

interface ToolbarProps {
  wasmReady: boolean;
  loading: boolean;
  activeAction: PipelineAction | 'format' | null;
  onAction: (action: PipelineAction) => void;
}

export function Toolbar({ wasmReady, loading, activeAction, onAction }: ToolbarProps) {
  return (
    <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-2 flex items-center gap-2">
      {/* Pipeline action buttons */}
      <div className="flex items-center gap-1.5">
        {ACTIONS.map(({ action, label, icon, available }) => {
          const isActive = loading && activeAction === action;
          const disabled = !wasmReady || loading || !available;

          return (
            <button
              key={action}
              data-tour={`toolbar-${action}`}
              onClick={() => {
                if (action !== 'format') {
                  onAction(action);
                }
              }}
              disabled={disabled}
              title={!available ? `${label} — not yet available in icl-runtime` : label}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
                border transition-colors duration-150 active:scale-[0.97]
                ${isActive
                  ? 'bg-blue-600 text-white border-blue-500'
                  : available
                    ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-gray-50 hover:border-gray-600'
                    : 'bg-gray-800/50 text-gray-600 border-gray-700/50 cursor-not-allowed'
                }
                ${disabled && !isActive ? 'opacity-60' : ''}
              `}
            >
              {isActive ? <Spinner /> : <span className="text-xs">{icon}</span>}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-5 w-px bg-gray-700 mx-2" />

      {/* Pipeline indicator */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <span>Pipeline:</span>
        {(['parse', 'normalize', 'verify', 'hash'] as const).map((step, i) => (
          <span key={step} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-700">→</span>}
            <span
              className={
                activeAction === step && loading
                  ? 'text-blue-400'
                  : 'text-gray-500'
              }
            >
              {step}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
