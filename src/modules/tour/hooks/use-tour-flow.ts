import { useCallback, useEffect, useRef, useState } from 'react';
import getLocalStorage from '@/lib/localStorage';
import { useTour } from '../engine/TourProvider';
import { TOUR_FLOWS, type TourFlowName } from '../flows';
import type { TourFlow } from '../types';

export type UseTourFlowOptions = {
  /** Start the flow automatically the first time it is required. */
  autoStart?: boolean;
  /** Delay before auto-starting, so the route finishes rendering. */
  autoStartDelay?: number;
  /** Extra condition (besides `requires`) that gates the auto-start. */
  enabled?: boolean;
};

function toList(value?: string | readonly string[]): readonly string[] {
  if (!value) {
    return [];
  }

  return typeof value === 'string' ? [value] : value;
}

function readSeenFlag(storageKey?: string) {
  if (!storageKey) {
    return false;
  }

  return getLocalStorage().getItem(storageKey) === '1';
}

/**
 * Binds a route to a tour flow: loads its steps, tracks the "already seen"
 * flag and optionally starts it automatically.
 */
export function useTourFlow(
  flowName: TourFlowName,
  {
    autoStart = false,
    autoStartDelay = 300,
    enabled = true,
  }: UseTourFlowOptions = {}
) {
  const flow = TOUR_FLOWS[flowName];
  const { setSteps, startTour, setIsTourCompleted, isActive } = useTour();
  const [isSeen, setIsSeen] = useState(true);
  const autoStartAttempted = useRef(false);

  useEffect(() => {
    const seen = readSeenFlag(flow.storageKey);

    setSteps([...flow.steps]);
    setIsSeen(seen);
    setIsTourCompleted(seen);
  }, [flow, setIsTourCompleted, setSteps]);

  const areRequirementsMet = useCallback(() => {
    const requirements = (flow as TourFlow).requires;

    return toList(requirements).every((dependency) => {
      const dependencyKey = TOUR_FLOWS[dependency as TourFlowName]?.storageKey;

      return !dependencyKey || readSeenFlag(dependencyKey);
    });
  }, [flow]);

  const markSeen = useCallback(() => {
    if (!flow.storageKey) {
      return;
    }

    getLocalStorage().setItem(flow.storageKey, '1');
    setIsSeen(true);
  }, [flow.storageKey]);

  const markUnseen = useCallback(() => {
    if (flow.storageKey) {
      getLocalStorage().removeItem(flow.storageKey);
    }

    setIsSeen(false);
    setIsTourCompleted(false);
  }, [flow.storageKey, setIsTourCompleted]);

  const startFlow = useCallback(() => {
    markSeen();
    setIsTourCompleted(false);
    startTour([...flow.steps]);
  }, [flow, markSeen, setIsTourCompleted, startTour]);

  const skipFlow = useCallback(() => {
    markSeen();
    setIsTourCompleted(true);
  }, [markSeen, setIsTourCompleted]);

  useEffect(() => {
    if (
      !autoStart ||
      !enabled ||
      isSeen ||
      isActive ||
      autoStartAttempted.current
    ) {
      return;
    }

    if (!areRequirementsMet()) {
      return;
    }

    autoStartAttempted.current = true;
    const timeoutId = window.setTimeout(() => {
      startFlow();
    }, autoStartDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    autoStart,
    enabled,
    isSeen,
    isActive,
    autoStartDelay,
    areRequirementsMet,
    startFlow,
  ]);

  return {
    flow,
    isSeen,
    isTourActive: isActive,
    shouldPrompt: !isSeen && areRequirementsMet(),
    startFlow,
    skipFlow,
    markSeen,
    markUnseen,
  };
}
