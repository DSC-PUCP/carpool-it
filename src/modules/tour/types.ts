import type { ReactNode } from 'react';

export type TourStepPosition = 'top' | 'bottom' | 'left' | 'right';

export type TourTarget = {
  id: string;
  position?: TourStepPosition;
};

export type TourSelector =
  | string
  | TourTarget
  | readonly (string | TourTarget)[];

export type TourStep = {
  selectorId: TourSelector;
  content: ReactNode;
  modalWidth?: number;
  modalHeight?: number;
  position?: TourStepPosition;
  shouldReload?: boolean;
};

export type TourFlow = {
  steps: readonly TourStep[];
  storageKey?: string;
  requires?: string | readonly string[];
};
