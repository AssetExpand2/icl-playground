import { useState, useCallback } from 'react';

// --- Types ---

/** A generic JSON value from the parsed AST */
type AstValue = string | number | boolean | null | AstValue[] | { [key: string]: AstValue };

// --- Node type styling ---

interface NodeStyle {
  icon: string;
  color: string;
}

const SECTION_STYLES: Record<string, NodeStyle> = {
  Contract:              { icon: '📜', color: 'text-purple-700 dark:text-purple-400' },
  Identity:              { icon: '🆔', color: 'text-blue-700 dark:text-blue-400' },
  PurposeStatement:      { icon: '🎯', color: 'text-green-700 dark:text-green-400' },
  DataSemantics:         { icon: '📊', color: 'text-cyan-700 dark:text-cyan-400' },
  BehavioralSemantics:   { icon: '⚙️', color: 'text-yellow-700 dark:text-yellow-400' },
  ExecutionConstraints:  { icon: '🔒', color: 'text-red-700 dark:text-red-400' },
  HumanMachineContract:  { icon: '🤝', color: 'text-pink-700 dark:text-pink-400' },
  Extensions:            { icon: '🧩', color: 'text-orange-700 dark:text-orange-400' },
};

function getNodeStyle(key: string): NodeStyle {
  return SECTION_STYLES[key] ?? { icon: '•', color: 'text-gray-400' };
}

function getValueTypeLabel(value: AstValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `Array[${value.length}]`;
  if (typeof value === 'object') return `Object{${Object.keys(value).length}}`;
  return typeof value;
}

// --- Component ---

interface AstViewerProps {
  /** Raw JSON string from parse result */
  astJson: string | null;
  /** Called when a node with source location is clicked */
  onNodeClick?: (line: number, column?: number) => void;
}

export function AstViewer({ astJson, onNodeClick }: AstViewerProps) {
  if (!astJson) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 p-4">
        <span className="text-3xl mb-3">🌳</span>
        <p className="text-sm">Run "Parse" to see the AST tree</p>
      </div>
    );
  }

  let parsed: AstValue;
  try {
    parsed = JSON.parse(astJson);
  } catch {
    return (
      <div className="p-4 text-red-400 text-sm font-mono">
        Failed to parse AST JSON
      </div>
    );
  }

  return (
    <div className="p-2 text-sm font-mono overflow-auto h-full">
      <AstNode label="root" value={parsed} depth={0} defaultOpen onNodeClick={onNodeClick} />
    </div>
  );
}

// --- Recursive Tree Node ---

interface AstNodeProps {
  label: string;
  value: AstValue;
  depth: number;
  defaultOpen?: boolean;
  onNodeClick?: (line: number, column?: number) => void;
}

function AstNode({ label, value, depth, defaultOpen = false, onNodeClick }: AstNodeProps) {
  const [open, setOpen] = useState(defaultOpen || depth < 2);

  const handleClick = useCallback(() => {
    // If this node has a source location, navigate to it
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const loc = value['location'] ?? value['span'] ?? value['pos'];
      if (loc && typeof loc === 'object' && !Array.isArray(loc)) {
        const line = (loc as Record<string, AstValue>)['line'];
        const col = (loc as Record<string, AstValue>)['column'];
        if (typeof line === 'number' && onNodeClick) {
          onNodeClick(line, typeof col === 'number' ? col : undefined);
        }
      }
    }
  }, [value, onNodeClick]);

  // Primitive value — render inline
  if (value === null || typeof value !== 'object') {
    return (
      <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: `${depth * 16}px` }}>
        <span className="text-gray-600">•</span>
        <span className="text-gray-500">{label}:</span>
        <PrimitiveValue value={value} />
      </div>
    );
  }

  // Array or Object — collapsible
  const isArray = Array.isArray(value);
  const entries = isArray
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value);

  const style = getNodeStyle(label);
  const typeLabel = getValueTypeLabel(value);

  return (
    <div>
      {/* Toggle row */}
      <div
        className="flex items-center gap-1 py-0.5 cursor-pointer hover:bg-gray-800/50 rounded px-1 group"
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {/* Expand/collapse chevron */}
        <svg
          className={`w-3 h-3 text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5l8 7-8 7z" />
        </svg>

        {/* Icon */}
        <span className="text-xs">{style.icon}</span>

        {/* Key name */}
        <span className={`font-medium ${style.color}`}>{label}</span>

        {/* Type badge */}
        <span className="text-gray-600 text-xs ml-1">{typeLabel}</span>

        {/* Click-to-navigate indicator */}
        {hasLocation(value) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-blue-500 hover:text-blue-400 transition-opacity"
            title="Jump to source"
          >
            ↗
          </button>
        )}
      </div>

      {/* Children */}
      {open && (
        <div>
          {entries.map(([key, val]) => (
            <AstNode
              key={key}
              label={key}
              value={val}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
          {entries.length === 0 && (
            <div
              className="text-gray-700 text-xs py-0.5"
              style={{ paddingLeft: `${(depth + 1) * 16}px` }}
            >
              {isArray ? '(empty array)' : '(empty object)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Primitive Value Display ---

function PrimitiveValue({ value }: { value: string | number | boolean | null }) {
  if (value === null) {
    return <span className="text-gray-600 italic">null</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-blue-700 dark:text-blue-400">{String(value)}</span>;
  }
  if (typeof value === 'number') {
    return <span className="text-green-700 dark:text-green-400">{value}</span>;
  }
  // String
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  const isTimestamp = /^\d{4}-\d{2}-\d{2}T/.test(value);

  if (isUuid) {
    return <span className="text-yellow-700 dark:text-yellow-400" title="UUID">{`"${value}"`}</span>;
  }
  if (isTimestamp) {
    return <span className="text-amber-700 dark:text-yellow-300" title="ISO8601">{`"${value}"`}</span>;
  }
  // Truncate long strings
  const display = value.length > 80 ? value.slice(0, 77) + '...' : value;
  return <span className="text-orange-700 dark:text-orange-300">{`"${display}"`}</span>;
}

// --- Helpers ---

function hasLocation(value: AstValue): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const loc = value['location'] ?? value['span'] ?? value['pos'];
  if (!loc || typeof loc !== 'object' || Array.isArray(loc)) return false;
  return typeof (loc as Record<string, AstValue>)['line'] === 'number';
}
