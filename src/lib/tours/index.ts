import { onboardingTourFlow } from '@/lib/tours/onboarding-tour';

export const TOUR_FLOWS = {
  onboarding: onboardingTourFlow,
} as const;

export type TourFlowName = keyof typeof TOUR_FLOWS;
