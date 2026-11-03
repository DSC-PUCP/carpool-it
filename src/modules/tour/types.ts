import type { ReactNode } from 'react';

export type TourStepPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * A step can point to several targets. The first visible one wins, which keeps
 * a single flow working across desktop (sidebar) and mobile (bottom navbar)
 * layouts without duplicating the flow.
 */
export type TourTarget = {
  id: string;
  /** Overrides the step position for this specific target. */
  position?: TourStepPosition;
};

export type TourSelector =
  | string
  | TourTarget
  | readonly (string | TourTarget)[];

export type TourStep = {
  selectorId: TourSelector;
  content: ReactNode;
  width?: number;
  height?: number;
  modalWidth?: number;
  modalHeight?: number;
  position?: TourStepPosition;
  onAdvance?: 'open' | 'click' | 'valueChange';
  onClickWithinArea?: () => void;
  shouldReload?: boolean;
};

export type TourFlowPrompt = {
  title: string;
  description: string;
  startLabel?: string;
  skipLabel?: string;
};

export type TourFlow = {
  steps: readonly TourStep[];
  /** localStorage flag that marks this flow as seen. */
  storageKey?: string;
  /**
   * Flow name(s) that must be seen before this flow is allowed to auto-start.
   * Used to chain tours (onboarding -> home -> profile).
   */
  requires?: string | readonly string[];
  /** Optional copy used by the generic "do you want a tour?" prompt. */
  prompt?: TourFlowPrompt;
};
