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
import { cn } from '@/lib/utils';
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
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  previousStep: () => void;
  endTour: () => void;
  isActive: boolean;
  startTour: () => void;
  setSteps: (steps: TourStep[]) => void;
  steps: TourStep[];
  isTourCompleted: boolean;
  setIsTourCompleted: (completed: boolean) => void;
};

interface TourProviderProps {
  children: React.ReactNode;
  onComplete?: (shouldReload: boolean) => void;
  className?: string;
  isTourCompleted?: boolean;
}

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
  return rect.width > 0 && rect.height > 0;
}

/**
 * Resolves the first target that exists and is actually rendered. Layouts
 * render both the sidebar and the mobile navbar in the DOM, so an id alone is
 * not enough to know which one the user can see.
 */
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

function findTourElement(selector: TourSelector): HTMLElement | null {
  return findTourTarget(selector)?.element ?? null;
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

function calculateContentPosition(
  elementPos: Rect,
  position: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
  modalWidth: number = DEFAULT_MODAL_WIDTH,
  modalHeight: number = DEFAULT_MODAL_HEIGHT
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = elementPos.left;
  let top = elementPos.top;

  switch (position) {
    case 'top':
      top = elementPos.top - modalHeight - PADDING;
      left = elementPos.left + elementPos.width / 2 - modalWidth / 2;
      break;
    case 'bottom':
      top = elementPos.top + elementPos.height + PADDING;
      left = elementPos.left + elementPos.width / 2 - modalWidth / 2;
      break;
    case 'left':
      left = elementPos.left - modalWidth - PADDING;
      top = elementPos.top + elementPos.height / 2 - modalHeight / 2;
      break;
    case 'right':
      left = elementPos.left + elementPos.width + PADDING;
      top = elementPos.top + elementPos.height / 2 - modalHeight / 2;
      break;
  }

  return {
    top: Math.max(
      PADDING,
      Math.min(top, viewportHeight - modalHeight - PADDING)
    ),
    left: Math.max(
      PADDING,
      Math.min(left, viewportWidth - modalWidth - PADDING)
    ),
    width: modalWidth,
    height: modalHeight,
  };
}

export function TourProvider({
  children,
  onComplete,
  className,
  isTourCompleted = false,
}: TourProviderProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [elementPosition, setElementPosition] = useState<Rect | null>(null);
  const [resolvedPosition, setResolvedPosition] = useState<
    TourStepPosition | undefined
  >(undefined);
  const [isCompleted, setIsCompleted] = useState(isTourCompleted);
  const [contentSize, setContentSize] = useState<{
    width: number;
    height: number;
  }>({
    width: DEFAULT_MODAL_WIDTH,
    height: DEFAULT_MODAL_HEIGHT,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<TourStep[]>(steps);
  stepsRef.current = steps;

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

  // Track the highlighted element while the step is in progress.
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
      // The target may render after the step starts (async data, dialogs...).
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

  // Keep the tooltip aligned with its real rendered size.
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
        width:
          steps[currentStep]?.modalWidth ?? rect.width ?? DEFAULT_MODAL_WIDTH,
        height:
          steps[currentStep]?.modalHeight ??
          rect.height ??
          DEFAULT_MODAL_HEIGHT,
      });
    };

    updateContentSize();

    const resizeObserver = new ResizeObserver(updateContentSize);
    resizeObserver.observe(contentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentStep, steps]);

  const setIsTourCompleted = useCallback((completed: boolean) => {
    setIsCompleted(completed);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= stepsRef.current.length - 1) {
        setIsCompleted(true);
        const currentStepData = stepsRef.current[prev];
        onComplete?.(currentStepData?.shouldReload ?? false);
        return -1;
      }

      return prev + 1;
    });
  }, [onComplete]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const endTour = useCallback(() => {
    setCurrentStep(-1);
  }, []);

  const startTour = useCallback(() => {
    if (stepsRef.current.length === 0) {
      return;
    }

    setCurrentStep(0);
  }, []);

  // Steps can advance on their own when the user interacts with the target.
  useEffect(() => {
    if (!activeStep?.onAdvance) {
      return;
    }

    const step = activeStep;
    const targetElement = findTourElement(step.selectorId);
    const handleEvent = () => nextStep();

    if (step.onAdvance === 'open') {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'open'
          ) {
            const target = mutation.target as HTMLElement;
            if (target.getAttribute('open') !== null) {
              nextStep();
              observer.disconnect();
            }
          }
        }
      });

      if (targetElement) {
        observer.observe(targetElement, { attributes: true });
      }

      return () => observer.disconnect();
    }

    if (step.onAdvance === 'click') {
      if (targetElement) {
        targetElement.addEventListener('click', handleEvent, { once: true });
        return () => targetElement.removeEventListener('click', handleEvent);
      }

      window.addEventListener('advanceDriverToDialog', handleEvent, {
        once: true,
      });
      return () =>
        window.removeEventListener('advanceDriverToDialog', handleEvent);
    }

    if (step.onAdvance === 'valueChange' && targetElement) {
      targetElement.addEventListener('input', handleEvent, { once: true });
      targetElement.addEventListener('change', handleEvent, { once: true });
      return () => {
        targetElement.removeEventListener('input', handleEvent);
        targetElement.removeEventListener('change', handleEvent);
      };
    }
  }, [activeStep, nextStep]);

  // Let clicks on the highlighted area trigger the step action.
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const step = currentStep >= 0 ? steps[currentStep] : undefined;
      if (!step?.onClickWithinArea || !elementPosition) {
        return;
      }

      const width = step.width || elementPosition.width;
      const height = step.height || elementPosition.height;

      const isWithinBounds =
        e.clientX >= elementPosition.left &&
        e.clientX <= elementPosition.left + width &&
        e.clientY >= elementPosition.top &&
        e.clientY <= elementPosition.top + height;

      if (isWithinBounds) {
        step.onClickWithinArea();
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [currentStep, elementPosition, steps]);

  // Escape always exits the tour.
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
      currentStep,
      totalSteps: steps.length,
      nextStep,
      previousStep,
      endTour,
      isActive: currentStep >= 0,
      startTour,
      setSteps,
      steps,
      isTourCompleted: isCompleted,
      setIsTourCompleted,
    }),
    [
      currentStep,
      steps,
      nextStep,
      previousStep,
      endTour,
      startTour,
      isCompleted,
      setIsTourCompleted,
    ]
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
                width: activeStep.width || elementPosition.width,
                height: activeStep.height || elementPosition.height,
                boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.6)',
              }}
              className={cn(
                'z-40 rounded-lg border-4 border-primary/60 pointer-events-none',
                className
              )}
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
                    {!activeStep.onAdvance && (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="text-sm font-medium text-primary hover:text-primary/90 bg-primary/10 px-4 py-2 rounded-md"
                      >
                        Entendido
                      </button>
                    )}
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
