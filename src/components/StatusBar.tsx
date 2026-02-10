interface StatusBarProps {
  /** Current cursor position from Monaco editor */
  cursorPosition: { line: number; column: number };
  /** Whether the last parse/verify succeeded */
  parseStatus: 'idle' | 'valid' | 'error';
  /** Number of errors from the last run */
  errorCount: number;
  /** icl-runtime version */
  runtimeVersion: string;
  /** Whether editor content differs from last loaded example */
  dirty: boolean;
}

export function StatusBar({
  cursorPosition,
  parseStatus,
  errorCount,
  runtimeVersion,
  dirty,
}: StatusBarProps) {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/80 px-4 py-1.5 flex items-center justify-between text-xs text-gray-500">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Parse status */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              parseStatus === 'valid'
                ? 'bg-green-500'
                : parseStatus === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-600'
            }`}
          />
          <span>
            {parseStatus === 'valid'
              ? 'Valid'
              : parseStatus === 'error'
                ? `${errorCount} error${errorCount !== 1 ? 's' : ''}`
                : 'Ready'}
          </span>
        </div>

        {/* Dirty indicator */}
        {dirty && (
          <span className="text-yellow-600">Modified</span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Cursor position */}
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>

        {/* Runtime version */}
        <span className="text-gray-600">
          icl-runtime {runtimeVersion}
        </span>

        {/* Spec link */}
        <a
          href="https://github.com/ICL-System/ICL-Spec"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          ICL Spec
        </a>
      </div>
    </footer>
  );
}
