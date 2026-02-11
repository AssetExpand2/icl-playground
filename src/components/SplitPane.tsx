import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

// --- Hook for media query ---

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// --- Component ---

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  /** Initial width of the right pane in pixels */
  defaultRightWidth?: number;
  /** Minimum right pane width in pixels */
  minRightWidth?: number;
  /** Maximum right pane width in pixels */
  maxRightWidth?: number;
  /** Breakpoint below which panes stack vertically */
  mobileBreakpoint?: string;
}

export function SplitPane({
  left,
  right,
  defaultRightWidth = 400,
  minRightWidth = 200,
  maxRightWidth = 800,
  mobileBreakpoint = '(max-width: 768px)',
}: SplitPaneProps) {
  const isMobile = useMediaQuery(mobileBreakpoint);
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRightWidth = rect.right - e.clientX;
      setRightWidth(Math.max(minRightWidth, Math.min(maxRightWidth, newRightWidth)));
    }

    function handleMouseUp() {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minRightWidth, maxRightWidth]);

  // Mobile: stack vertically
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-[200px]">{left}</div>
        <div className="h-px bg-gray-800" />
        <div className="flex-1 min-h-[200px] bg-gray-900">{right}</div>
      </div>
    );
  }

  // Desktop: horizontal split with draggable divider
  return (
    <div ref={containerRef} className="flex flex-1 min-h-0">
      {/* Left pane — takes remaining space */}
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">{left}</div>

      {/* Draggable divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 bg-gray-800 hover:bg-blue-500/50 cursor-col-resize transition-colors
          flex-shrink-0 relative group"
      >
        {/* Visual grip indicator */}
        <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/10" />
      </div>

      {/* Right pane — resizable */}
      <div
        className="bg-gray-900 overflow-hidden"
        style={{ width: `${rightWidth}px`, flexShrink: 0 }}
      >
        {right}
      </div>
    </div>
  );
}
