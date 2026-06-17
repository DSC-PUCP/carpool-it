'use client';

import { Torus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TourStep {
  content: React.ReactNode;
  selectorId: string;
  width?: number;
  height?: number;
  modalWidth?: number;
  modalHeight?: number;
  onClickWithinArea?: () => void;
  onAdvance?: 'open' | 'click' | 'valueChange';
  position?: 'top' | 'bottom' | 'left' | 'right';
  shouldReload?: boolean;
}

interface TourContextType {
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
}

interface TourProviderProps {
  children: React.ReactNode;
  onComplete?: (shouldReload: boolean) => void;
  className?: string;
  isTourCompleted?: boolean;
}

const TourContext = createContext<TourContextType | null>(null);

const PADDING = 16;
const DEFAULT_MODAL_WIDTH = 300;
const DEFAULT_MODAL_HEIGHT = 120;

function getElementPosition(id: string) {
  const element = document.getElementById(id);
  if (!element) return null;

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function calculateContentPosition(
  elementPos: { top: number; left: number; width: number; height: number },
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
  const [elementPosition, setElementPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(isTourCompleted);
  const [contentSize, setContentSize] = useState<{
    width: number;
    height: number;
  }>({
    width: DEFAULT_MODAL_WIDTH,
    height: DEFAULT_MODAL_HEIGHT,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);

  const updateElementPosition = useCallback(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return;
    }

    const position = getElementPosition(steps[currentStep]?.selectorId ?? '');
    if (position) {
      setElementPosition(position);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateElementPosition();
    window.addEventListener('resize', updateElementPosition);
    window.addEventListener('scroll', updateElementPosition);

    return () => {
      window.removeEventListener('resize', updateElementPosition);
      window.removeEventListener('scroll', updateElementPosition);
    };
  }, [updateElementPosition]);

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
      if (prev >= steps.length - 1) {
        setIsTourCompleted(true);
        const currentStepData = steps[prev];
        onComplete?.(currentStepData?.shouldReload ?? false);
        return -1;
      }

      return prev + 1;
    });
  }, [onComplete, setIsTourCompleted, steps]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    if (currentStep < 0 || !steps[currentStep]?.onAdvance) return;

    const onAdvanceType = steps[currentStep].onAdvance;

    const handleEvent = () => {
      nextStep();
    };

    if (onAdvanceType === 'open') {
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

      const targetElement = document.querySelector(
        `[id="${steps[currentStep].selectorId}"]`
      );
      if (targetElement) {
        observer.observe(targetElement, { attributes: true });
      }

      return () => observer.disconnect();
    }

    if (onAdvanceType === 'click') {
      const targetElement = document.querySelector(
        `[id="${steps[currentStep].selectorId}"]`
      );
      if (targetElement) {
        targetElement.addEventListener('click', handleEvent, { once: true });
        return () => targetElement.removeEventListener('click', handleEvent);
      }

      const handleCustomEvent = () => {
        nextStep();
      };
      window.addEventListener('advanceDriverToDialog', handleCustomEvent, {
        once: true,
      });
      return () =>
        window.removeEventListener('advanceDriverToDialog', handleCustomEvent);
    }

    if (onAdvanceType === 'valueChange') {
      const targetElement = document.querySelector(
        `[id="${steps[currentStep].selectorId}"]`
      );
      if (targetElement) {
        targetElement.addEventListener('input', handleEvent, { once: true });
        targetElement.addEventListener('change', handleEvent, { once: true });
        return () => {
          targetElement.removeEventListener('input', handleEvent);
          targetElement.removeEventListener('change', handleEvent);
        };
      }
    }
  }, [currentStep, steps, nextStep]);

  const endTour = useCallback(() => {
    setCurrentStep(-1);
  }, []);

  const startTour = useCallback(() => {
    if (steps.length === 0) {
      return;
    }

    setCurrentStep(0);
  }, [steps.length]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (
        currentStep < 0 ||
        !elementPosition ||
        !steps[currentStep]?.onClickWithinArea
      ) {
        return;
      }

      const clickY = e.clientY;
      const clickXViewport = e.clientX;
      const width = steps[currentStep]?.width || elementPosition.width;
      const height = steps[currentStep]?.height || elementPosition.height;

      const isWithinBounds =
        clickXViewport >= elementPosition.left &&
        clickXViewport <= elementPosition.left + width &&
        clickY >= elementPosition.top &&
        clickY <= elementPosition.top + height;

      if (isWithinBounds) {
        steps[currentStep].onClickWithinArea?.();
      }
    },
    [currentStep, elementPosition, steps]
  );

  useEffect(() => {
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  const contentPosition =
    currentStep >= 0 && elementPosition
      ? calculateContentPosition(
          elementPosition,
          steps[currentStep]?.position,
          steps[currentStep]?.modalWidth ?? contentSize.width,
          steps[currentStep]?.modalHeight ?? contentSize.height
        )
      : null;

  return (
    <TourContext.Provider
      value={{
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
      }}
    >
      {children}
      <AnimatePresence>
        {currentStep >= 0 && elementPosition && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: elementPosition.top,
                left: elementPosition.left,
                width: steps[currentStep]?.width || elementPosition.width,
                height: steps[currentStep]?.height || elementPosition.height,
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
              <div className="text-muted-foreground absolute right-4 top-4 text-xs">
                {currentStep + 1} / {steps.length}
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
                    {steps[currentStep]?.content}
                  </motion.div>

                  <div className="mt-4 flex justify-center">
                    {!steps[currentStep]?.onAdvance && (
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

export function TourAlertDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { startTour, steps, isTourCompleted, currentStep } = useTour();

  if (isTourCompleted || steps.length === 0 || currentStep > -1) {
    return null;
  }

  const handleSkip = async () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <motion.div
              initial={{ scale: 0.7, filter: 'blur(10px)' }}
              animate={{
                scale: 1,
                filter: 'blur(0px)',
                y: [0, -8, 0],
                rotate: [42, 48, 42],
              }}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                y: {
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                },
              }}
            >
              <Torus className="size-32 stroke-1 text-primary" />
            </motion.div>
          </div>
          <AlertDialogTitle className="text-center text-xl font-medium">
            Bienvenido al recorrido
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground mt-2 text-center text-sm">
            Haz un recorrido breve para conocer las funciones principales de la
            aplicación.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-6 space-y-3">
          <Button onClick={startTour} className="w-full">
            Iniciar recorrido
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            Omitir
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
