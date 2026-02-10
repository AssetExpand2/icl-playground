import { useState, useRef, useEffect, useCallback } from 'react';
import { EXAMPLE_CONTRACTS } from '../icl/types';
import type { ExampleContract } from '../icl/types';

// --- Component ---

interface ExamplePickerProps {
  /** Whether the editor has unsaved changes from the last loaded content */
  dirty: boolean;
  /** Called when a new example is selected — receives the file content */
  onSelect: (source: string) => void;
}

export function ExamplePicker({ dirty, onSelect }: ExamplePickerProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const loadExample = useCallback(
    async (example: ExampleContract) => {
      if (dirty) {
        const confirmed = window.confirm(
          `Load "${example.name}"?\n\nYour current changes will be replaced.`,
        );
        if (!confirmed) return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}examples/${example.filename}`,
        );
        const text = await res.text();
        onSelect(text);
      } catch {
        onSelect(`// Failed to load ${example.filename}`);
      }
      setOpen(false);
    },
    [dirty, onSelect],
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
          bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-50
          transition-colors duration-150"
      >
        <span className="text-xs">📄</span>
        <span>Examples</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Example Contracts
            </p>
          </div>
          {EXAMPLE_CONTRACTS.map((example) => (
            <button
              key={example.filename}
              onClick={() => loadExample(example)}
              className="w-full text-left px-3 py-2.5 hover:bg-gray-700/50 transition-colors
                border-b border-gray-700/50 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-200">
                {example.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {example.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
