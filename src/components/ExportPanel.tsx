import { useState, useCallback } from 'react';
import {
  initWasm,
  isInitialized,
  parseContract,
  normalize,
} from '../icl/runtime';

// --- Helpers ---

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

// --- Component ---

interface ExportPanelProps {
  source: string;
  /** The last pipeline result output (for copy). */
  lastOutput?: string;
}

type CopiedKey = 'ast' | 'normalized' | 'output' | null;

export function ExportPanel({ source, lastOutput }: ExportPanelProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopiedKey>(null);

  const showCopied = useCallback((key: CopiedKey) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const ensureWasm = useCallback(async () => {
    if (!isInitialized()) await initWasm();
  }, []);

  // Export AST as JSON file
  const handleExportAst = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      await ensureWasm();
      const ast = parseContract(source);
      const pretty = JSON.stringify(JSON.parse(ast), null, 2);
      downloadFile('contract-ast.json', pretty, 'application/json');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProcessing(false);
    }
  }, [source, ensureWasm]);

  // Export normalized .icl
  const handleExportNormalized = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      await ensureWasm();
      const normalized = normalize(source);
      downloadFile('contract-normalized.icl', normalized, 'text/plain');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setProcessing(false);
    }
  }, [source, ensureWasm]);

  // Copy AST to clipboard
  const handleCopyAst = useCallback(async () => {
    setError(null);
    try {
      await ensureWasm();
      const ast = parseContract(source);
      const pretty = JSON.stringify(JSON.parse(ast), null, 2);
      await copyToClipboard(pretty);
      showCopied('ast');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [source, ensureWasm, showCopied]);

  // Copy normalized to clipboard
  const handleCopyNormalized = useCallback(async () => {
    setError(null);
    try {
      await ensureWasm();
      const normalized = normalize(source);
      await copyToClipboard(normalized);
      showCopied('normalized');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [source, ensureWasm, showCopied]);

  // Copy last output to clipboard
  const handleCopyOutput = useCallback(async () => {
    if (!lastOutput) return;
    await copyToClipboard(lastOutput);
    showCopied('output');
  }, [lastOutput, showCopied]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
        Export & Copy
      </h3>

      {error && (
        <div className="p-3 rounded bg-red-950/30 border border-red-900/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Download section */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          Download
        </p>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            onClick={handleExportAst}
            disabled={processing || !source.trim()}
            icon="↓"
            label="AST JSON"
          />
          <ExportButton
            onClick={handleExportNormalized}
            disabled={processing || !source.trim()}
            icon="↓"
            label="Normalized .icl"
          />
        </div>
      </div>

      {/* Copy section */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          Copy to Clipboard
        </p>
        <div className="flex flex-wrap gap-2">
          <ExportButton
            onClick={handleCopyAst}
            disabled={!source.trim()}
            icon={copied === 'ast' ? '✓' : '⎘'}
            label={copied === 'ast' ? 'Copied!' : 'AST JSON'}
            active={copied === 'ast'}
          />
          <ExportButton
            onClick={handleCopyNormalized}
            disabled={!source.trim()}
            icon={copied === 'normalized' ? '✓' : '⎘'}
            label={copied === 'normalized' ? 'Copied!' : 'Normalized'}
            active={copied === 'normalized'}
          />
          <ExportButton
            onClick={handleCopyOutput}
            disabled={!lastOutput}
            icon={copied === 'output' ? '✓' : '⎘'}
            label={copied === 'output' ? 'Copied!' : 'Last Output'}
            active={copied === 'output'}
          />
        </div>
      </div>
    </div>
  );
}

// --- Button ---

function ExportButton({
  onClick,
  disabled,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium
        transition-colors duration-150
        ${active
          ? 'bg-green-800 text-green-300'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-50'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
