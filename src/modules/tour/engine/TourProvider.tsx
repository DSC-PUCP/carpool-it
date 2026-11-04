'use client';

import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  TourSelector,
  TourStep,
  TourStepPosition,
  TourTarget,
} from '../types';

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type TourContextValue = {
  isActive: boolean;
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
};

type TourProviderProps = {
  children: React.ReactNode;
  onComplete?: (shouldReload: boolean) => void;
};

const TourContext = createContext<TourContextValue | null>(null);

const PADDING = 16;
const DEFAULT_MODAL_WIDTH = 300;
const DEFAULT_MODAL_HEIGHT = 120;
const MISSING_STEP_POLL_INTERVAL = 150;
const MISSING_STEP_MAX_ATTEMPTS = 20;

function toTargetList(selector: TourSelector): readonly TourTarget[] {
  const targets =
    typeof selector === 'string' || !Array.isArray(selector)
      ? [selector as string | TourTarget]
      : (selector as readonly (string | TourTarget)[]);

  return targets.map((target) =>
    typeof target === 'string' ? { id: target } : target
  );
}

function isVisibleElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  // `display: none` subtrees still report a rect in some browsers.
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility();
  }

  return true;
}

function findTourTarget(selector: TourSelector): {
  element: HTMLElement;
  position?: TourStepPosition;
} | null {
  for (const target of toTargetList(selector)) {
    const element = document.getElementById(target.id);
    if (element && isVisibleElement(element)) {
      return { element, position: target.position };
    }
  }

  return null;
}

function getElementRect(element: HTMLElement): Rect {
  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

const POSITION_CANDIDATES: Record<
  TourStepPosition,
  readonly TourStepPosition[]
> = {
  top: ['top', 'bottom', 'right', 'left'],
  bottom: ['bottom', 'top', 'right', 'left'],
  left: ['left', 'right', 'bottom', 'top'],
  right: ['right', 'left', 'bottom', 'top'],
};

function rectsOverlap(a: Rect, b: Rect) {
  return !(
    a.left + a.width <= b.left ||
    b.left + b.width <= a.left ||
    a.top + a.height <= b.top ||
    b.top + b.height <= a.top
  );
}

function computeRect(
  elementPos: Rect,
  position: TourStepPosition,
  width: number,
  height: number
): Rect {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = elementPos.left;
  let top = elementPos.top;

  switch (position) {
    case 'top':
      top = elementPos.top - height - PADDING;
      left = elementPos.left + elementPos.width / 2 - width / 2;
      break;
    case 'bottom':
      top = elementPos.top + elementPos.height + PADDING;
      left = elementPos.left + elementPos.width / 2 - width / 2;
      break;
    case 'left':
      left = elementPos.left - width - PADDING;
      top = elementPos.top + elementPos.height / 2 - height / 2;
      break;
    case 'right':
      left = elementPos.left + elementPos.width + PADDING;
      top = elementPos.top + elementPos.height / 2 - height / 2;
      break;
  }

  return {
    top: Math.max(PADDING, Math.min(top, viewportHeight - height - PADDING)),
    left: Math.max(PADDING, Math.min(left, viewportWidth - width - PADDING)),
    width,
    height,
  };
}

function calculateContentPosition(
  elementPos: Rect,
  position: TourStepPosition = 'bottom',
  modalWidth: number = DEFAULT_MODAL_WIDTH,
  modalHeight: number = DEFAULT_MODAL_HEIGHT
): Rect {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(modalWidth, viewportWidth - PADDING * 2);
  const height = Math.min(modalHeight, viewportHeight - PADDING * 2);

  const candidates = POSITION_CANDIDATES[position].map((candidate) =>
    computeRect(elementPos, candidate, width, height)
  );

  return (
    candidates.find((rect) => !rectsOverlap(rect, elementPos)) ?? candidates[0]
  );
}

export function TourProvider({ children, onComplete }: TourProviderProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [elementPosition, setElementPosition] = useState<Rect | null>(null);
  const [resolvedPosition, setResolvedPosition] = useState<
    TourStepPosition | undefined
  >(undefined);
  const [contentSize, setContentSize] = useState({
    width: DEFAULT_MODAL_WIDTH,
    height: DEFAULT_MODAL_HEIGHT,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);

  const activeStep = currentStep >= 0 ? steps[currentStep] : undefined;

  const updateElementPosition = useCallback((): boolean => {
    const step = currentStep >= 0 ? steps[currentStep] : undefined;
    if (!step) {
      return false;
    }

    const target = findTourTarget(step.selectorId);
    setElementPosition(target ? getElementRect(target.element) : null);
    setResolvedPosition(target?.position);

    return Boolean(target);
  }, [currentStep, steps]);

  useEffect(() => {
    if (currentStep < 0) {
      setElementPosition(null);
      setResolvedPosition(undefined);
      return;
    }

    const step = steps[currentStep];
    if (!step) {
      return;
    }

    const target = findTourTarget(step.selectorId);
    if (target) {
      target.element.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'smooth',
      });
      setElementPosition(getElementRect(target.element));
      setResolvedPosition(target.position);
    } else {
      setElementPosition(null);
      setResolvedPosition(undefined);
    }

    let attempts = 0;
    let pollId: number | undefined;
    if (!target) {
      // Targets can mount after the step starts (async data, dialogs).
      pollId = window.setInterval(() => {
        attempts += 1;

        if (updateElementPosition() || attempts >= MISSING_STEP_MAX_ATTEMPTS) {
          window.clearInterval(pollId);
        }
      }, MISSING_STEP_POLL_INTERVAL);
    }

    window.addEventListener('resize', updateElementPosition);
    window.addEventListener('scroll', updateElementPosition, true);

    return () => {
      if (pollId) {
        window.clearInterval(pollId);
      }
      window.removeEventListener('resize', updateElementPosition);
      window.removeEventListener('scroll', updateElementPosition, true);
    };
  }, [currentStep, steps, updateElementPosition]);

  useEffect(() => {
    if (currentStep < 0) {
      return;
    }

    const contentElement = contentRef.current;
    if (!contentElement) {
      return;
    }

    const updateContentSize = () => {
      const rect = contentElement.getBoundingClientRect();
      setContentSize({
        width: steps[currentStep]?.modalWidth ?? rect.width,
        height: steps[currentStep]?.modalHeight ?? rect.height,
      });
    };

    updateContentSize();

    const resizeObserver = new ResizeObserver(updateContentSize);
    resizeObserver.observe(contentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentStep, steps]);

  const nextStep = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      onComplete?.(steps[currentStep]?.shouldReload ?? false);
      setCurrentStep(-1);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  }, [currentStep, steps, onComplete]);

  const endTour = useCallback(() => {
    setCurrentStep(-1);
  }, []);

  const startTour = useCallback((nextSteps: TourStep[]) => {
    if (nextSteps.length === 0) {
      return;
    }

    setSteps(nextSteps);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (currentStep < 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        endTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, endTour]);

  const contentPosition =
    activeStep && elementPosition
      ? calculateContentPosition(
          elementPosition,
          resolvedPosition ?? activeStep.position,
          activeStep.modalWidth ?? contentSize.width,
          activeStep.modalHeight ?? contentSize.height
        )
      : null;

  const contextValue = useMemo<TourContextValue>(
    () => ({
      isActive: currentStep >= 0,
      startTour,
      endTour,
    }),
    [currentStep, startTour, endTour]
  );

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {activeStep && elementPosition && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: elementPosition.top,
                left: elementPosition.left,
                width: elementPosition.width,
                height: elementPosition.height,
                boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.6)',
              }}
              className="z-40 rounded-lg border-4 border-primary/60 pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, top: 50, right: 50 }}
              animate={{
                opacity: 1,
                y: 0,
                top: contentPosition?.top ?? PADDING,
                left: contentPosition?.left ?? PADDING,
              }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.4 },
              }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                position: 'fixed',
                width: contentPosition?.width ?? contentSize.width,
              }}
              className="bg-background relative z-100 rounded-lg border p-4 shadow-lg"
              ref={contentRef}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {currentStep + 1} / {steps.length}
                </span>
                <button
                  type="button"
                  onClick={endTour}
                  className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
                >
                  Saltar
                </button>
              </div>

              <AnimatePresence mode="wait">
                <div>
                  <motion.div
                    key={`tour-content-${currentStep}`}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    className="overflow-hidden"
                    transition={{
                      duration: 0.2,
                      height: { duration: 0.4 },
                    }}
                  >
                    {activeStep.content}
                  </motion.div>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="text-sm font-medium text-primary hover:text-primary/90 bg-primary/10 px-4 py-2 rounded-md"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);

  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }

  return context;
}
