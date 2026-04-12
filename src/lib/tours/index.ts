import { onboardingMobileTourFlow } from '@/lib/tours/onboarding-mobile-tour';
import { onboardingTourFlow } from '@/lib/tours/onboarding-tour';

export const TOUR_FLOWS = {
  onboarding: onboardingTourFlow,
  onboardingMobile: onboardingMobileTourFlow,
} as const;

export type TourFlowName = keyof typeof TOUR_FLOWS;
