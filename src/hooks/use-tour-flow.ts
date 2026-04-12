import { useEffect, useState } from 'react';
import { useTour } from '@/components/tour';
import getLocalStorage from '@/lib/localStorage';
import { TOUR_FLOWS, type TourFlowName } from '@/lib/tours';

export function useTourFlow(flowName: TourFlowName) {
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

  const markSeen = () => {
    if (!flow.storageKey) {
      return;
    }

    const ls = getLocalStorage();
    ls.setItem(flow.storageKey, '1');
    setIsSeen(true);
  };

  const markUnseen = () => {
    if (!flow.storageKey) {
      setIsSeen(false);
      setIsTourCompleted(false);
      return;
    }

    const ls = getLocalStorage();
    ls.removeItem(flow.storageKey);
    setIsSeen(false);
    setIsTourCompleted(false);
  };

  const startFlow = () => {
    markSeen();
    setIsTourCompleted(false);
    startTour();
  };

  const skipFlow = () => {
    markSeen();
    setIsTourCompleted(true);
  };

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
