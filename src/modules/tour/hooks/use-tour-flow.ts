import { useCallback, useEffect, useRef, useState } from 'react';
import getLocalStorage from '@/lib/localStorage';
import { TOUR_GATES, type TourGateName } from '../constants';
import { useTour } from '../engine/TourProvider';
import { TOUR_FLOWS, type TourFlowName } from '../flows';
import type { TourFlow } from '../types';

export type UseTourFlowOptions = {
  autoStart?: boolean;
  autoStartDelay?: number;
  enabled?: boolean;
};

export const TOUR_GATE_EVENT = 'carpool:tour-gate-changed';

export function notifyTourGateChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(TOUR_GATE_EVENT));
}

function isRequirementMet(requirement: string) {
  const key =
    requirement in TOUR_GATES
      ? TOUR_GATES[requirement as TourGateName]
      : TOUR_FLOWS[requirement as TourFlowName].storageKey;

  return !key || getLocalStorage().getItem(key) === '1';
}

function areRequirementsMet(flow: TourFlow) {
  const { requires } = flow;
  const requirements =
    typeof requires === 'string' ? [requires] : (requires ?? []);

  return requirements.every(isRequirementMet);
}

/** Starts any flow on demand, replacing the loaded steps. */
export function useTourStart() {
  const { startTour } = useTour();

  return useCallback(
    (flowName: TourFlowName) => startTour([...TOUR_FLOWS[flowName].steps]),
    [startTour]
  );
}

/** Auto-starts a flow once its `requires` gates are satisfied. */
export function useTourFlow(
  flowName: TourFlowName,
  {
    autoStart = false,
    autoStartDelay = 300,
    enabled = true,
  }: UseTourFlowOptions = {}
) {
  const flow: TourFlow = TOUR_FLOWS[flowName];
  const { startTour } = useTour();
  const [isSeen, setIsSeen] = useState(true);
  const [requirementsMet, setRequirementsMet] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    setIsSeen(
      flow.storageKey
        ? getLocalStorage().getItem(flow.storageKey) === '1'
        : false
    );
  }, [flow.storageKey]);

  const syncRequirements = useCallback(
    () => setRequirementsMet(areRequirementsMet(flow)),
    [flow]
  );

  useEffect(() => {
    syncRequirements();
    window.addEventListener(TOUR_GATE_EVENT, syncRequirements);

    return () => {
      window.removeEventListener(TOUR_GATE_EVENT, syncRequirements);
    };
  }, [syncRequirements]);

  useEffect(() => {
    if (
      !autoStart ||
      !enabled ||
      isSeen ||
      !requirementsMet ||
      started.current
    ) {
      return;
    }

    started.current = true;
    const timeoutId = window.setTimeout(() => {
      if (flow.storageKey) {
        getLocalStorage().setItem(flow.storageKey, '1');
      }

      setIsSeen(true);
      startTour([...flow.steps]);
    }, autoStartDelay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    autoStart,
    enabled,
    isSeen,
    requirementsMet,
    autoStartDelay,
    flow,
    startTour,
  ]);
}
