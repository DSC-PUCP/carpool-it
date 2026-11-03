import { driverOnboardingTourFlow } from './driver-onboarding';
import { driverPublishTourFlow } from './driver-publish';
import { homeTourFlow } from './home';
import { offerTourFlow } from './offer';
import { onboardingTourFlow } from './onboarding';
import { onboardingMobileTourFlow } from './onboarding-mobile';
import { passengerTourFlow } from './passenger';
import { profileTourFlow } from './profile';

/**
 * Single source of truth for every tour in the app.
 * Add a flow here and it becomes available to `useTourFlow(name)`.
 */
export const TOUR_FLOWS = {
  onboarding: onboardingTourFlow,
  onboardingMobile: onboardingMobileTourFlow,
  home: homeTourFlow,
  profile: profileTourFlow,
  passenger: passengerTourFlow,
  offer: offerTourFlow,
  driverOnboarding: driverOnboardingTourFlow,
  driverPublish: driverPublishTourFlow,
} as const;

export type TourFlowName = keyof typeof TOUR_FLOWS;

export { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
export type { TourFlow, TourStep } from '../types';
