import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'icl-playground-welcome-dismissed';

export function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — show overlay
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    if (dontShow) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
    }
    setVisible(false);
  }, [dontShow]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.png" alt="ICL" className="w-8 h-8 rounded" />
          <h2 className="text-lg font-bold text-gray-50">Welcome to ICL Playground</h2>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed mb-3">
          <strong>ICL</strong> (Immutable Contract Language) is a deterministic language for
          defining verifiable, tamper-proof contracts. This playground lets you write, parse,
          normalize, verify, and execute ICL contracts directly in the browser.
        </p>

        {/* Quick start */}
        <div className="bg-gray-800/70 rounded-lg p-3 mb-5">
          <p className="text-sm text-gray-200 font-medium mb-1.5">Quick start:</p>
          <ol className="text-sm text-gray-400 list-decimal list-inside space-y-1">
            <li>Edit a contract in the left editor pane</li>
            <li>
              Click <strong className="text-blue-400">Parse</strong> in the toolbar to see the AST
              <span className="ml-1 text-gray-500">→</span>
            </li>
            <li>
              Try <strong className="text-violet-400">Normalize</strong>, <strong className="text-emerald-400">Verify</strong>, and <strong className="text-amber-400">Hash</strong>
            </li>
            <li>Switch to the <strong className="text-gray-200">Tools</strong> tab group for Diff, Execute & more</li>
          </ol>
        </div>

        {/* Don't show again + Dismiss */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/30"
            />
            Don't show again
          </label>
          <button
            onClick={dismiss}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
