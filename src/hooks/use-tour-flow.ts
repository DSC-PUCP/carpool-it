import { useCallback, useEffect, useState } from 'react';
import { useTour } from '@/components/tour';
import getLocalStorage from '@/lib/localStorage';
import { TOUR_FLOWS, type TourFlowName } from '@/lib/tours';

type UseTourFlowOptions = {
  autoStart?: boolean;
  autoStartDelay?: number;
};

export function useTourFlow(
  flowName: TourFlowName,
  { autoStart = false, autoStartDelay = 300 }: UseTourFlowOptions = {}
) {
  const flow = TOUR_FLOWS[flowName];
  const { setSteps, startTour, setIsTourCompleted } = useTour();
  const [isSeen, setIsSeen] = useState(true);

  useEffect(() => {
    const ls = getLocalStorage();
    const seen = flow.storageKey ? ls.getItem(flow.storageKey) === '1' : false;

    setSteps([...flow.steps]);
    setIsSeen(seen);
    setIsTourCompleted(seen);
  }, [flow, setIsTourCompleted, setSteps]);

  const markSeen = useCallback(() => {
    if (!flow.storageKey) {
      return;
    }

    const ls = getLocalStorage();
    ls.setItem(flow.storageKey, '1');
    setIsSeen(true);
  }, [flow.storageKey]);

  const markUnseen = useCallback(() => {
    if (!flow.storageKey) {
      setIsSeen(false);
      setIsTourCompleted(false);
      return;
    }

    const ls = getLocalStorage();
    ls.removeItem(flow.storageKey);
    setIsSeen(false);
    setIsTourCompleted(false);
  }, [flow.storageKey, setIsTourCompleted]);

  const startFlow = useCallback(() => {
    markSeen();
    setIsTourCompleted(false);
    startTour();
  }, [markSeen, setIsTourCompleted, startTour]);

  const skipFlow = useCallback(() => {
    markSeen();
    setIsTourCompleted(true);
  }, [markSeen, setIsTourCompleted]);

  useEffect(() => {
    if (!autoStart || isSeen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startFlow();
    }, autoStartDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoStart, autoStartDelay, isSeen, startFlow]);

  return {
    flow,
    isSeen,
    shouldPrompt: !isSeen,
    startFlow,
    skipFlow,
    markSeen,
    markUnseen,
  };
}
