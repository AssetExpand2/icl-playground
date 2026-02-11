import { useState, useEffect, useCallback, useRef } from 'react';

// --- Tour Step Definitions ---

interface TourStep {
  target: string;          // data-tour attribute value
  title: string;
  description: string;
  position: 'bottom' | 'top' | 'right' | 'left';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'editor',
    title: 'Contract Editor',
    description: 'Write or edit ICL contracts here. Syntax highlighting, auto-completion, and bracket matching are built in.',
    position: 'right',
  },
  {
    target: 'toolbar-parse',
    title: 'Parse',
    description: 'Click Parse to turn your contract text into an Abstract Syntax Tree (AST). This is the first pipeline step.',
    position: 'bottom',
  },
  {
    target: 'group-output',
    title: 'Output Group',
    description: 'Switch here to see parse results, errors, the AST tree viewer, and raw AST JSON.',
    position: 'bottom',
  },
  {
    target: 'toolbar-normalize',
    title: 'Normalize',
    description: 'Normalize converts the contract to a canonical form — consistent key order, whitespace, and formatting.',
    position: 'bottom',
  },
  {
    target: 'toolbar-verify',
    title: 'Verify',
    description: 'Verify checks the contract against ICL rules: required fields, type constraints, and structural integrity.',
    position: 'bottom',
  },
  {
    target: 'toolbar-hash',
    title: 'Hash',
    description: 'Generates a deterministic semantic hash. The same contract always produces the same hash — this proves immutability.',
    position: 'bottom',
  },
  {
    target: 'group-tools',
    title: 'Tools Group',
    description: 'Switch here for Pipeline visualization, Determinism checks, Diff comparisons, Execute, and Export.',
    position: 'bottom',
  },
];

// --- Component ---

interface GuidedTourProps {
  active: boolean;
  onFinish: () => void;
}

interface TooltipPos {
  top: number;
  left: number;
  highlightRect: DOMRect | null;
}

export function GuidedTour({ active, onFinish }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[step];

  // Position the tooltip relative to the target element
  const positionTooltip = useCallback(() => {
    if (!currentStep || !active) return;

    const el = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!el) {
      setPos(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const gap = 12;

    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        break;
      case 'top':
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        break;
    }

    setPos({ top, left, highlightRect: rect });
  }, [currentStep, active]);

  useEffect(() => {
    if (!active) return;
    positionTooltip();

    // Re-position on scroll/resize
    const handler = () => positionTooltip();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [active, positionTooltip]);

  // Reset step when tour starts
  useEffect(() => {
    if (active) setStep(0);
  }, [active]);

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  }, [step, onFinish]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  if (!active || !currentStep) return null;

  return (
    <>
      {/* Backdrop overlay — semi-transparent */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onFinish} />

      {/* Highlight ring around target */}
      {pos?.highlightRect && (
        <div
          className="fixed z-50 pointer-events-none rounded-md ring-2 ring-blue-500 animate-pulse"
          style={{
            top: pos.highlightRect.top - 4,
            left: pos.highlightRect.left - 4,
            width: pos.highlightRect.width + 8,
            height: pos.highlightRect.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      {pos && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 border border-gray-600 rounded-lg shadow-xl p-4 max-w-xs"
          style={{
            top: pos.top,
            left: pos.left,
            transform:
              currentStep.position === 'bottom'
                ? 'translateX(-50%)'
                : currentStep.position === 'top'
                  ? 'translateX(-50%) translateY(-100%)'
                  : currentStep.position === 'right'
                    ? 'translateY(-50%)'
                    : 'translateX(-100%) translateY(-50%)',
          }}
        >
          {/* Step counter */}
          <div className="text-xs text-blue-400 mb-1">
            Step {step + 1} of {TOUR_STEPS.length}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-100 mb-1">{currentStep.title}</h3>

          {/* Description */}
          <p className="text-xs text-gray-400 leading-relaxed mb-3">{currentStep.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={onFinish}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-2.5 py-1 text-xs text-gray-300 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
              >
                {step === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
