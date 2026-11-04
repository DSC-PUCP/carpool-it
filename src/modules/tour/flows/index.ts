import type { TourFlow } from '../types';
import { driverOnboardingTourFlow } from './driver-onboarding';
import { driverPublishTourFlow } from './driver-publish';
import { homeTourFlow } from './home';
import { offerTourFlow } from './offer';
import { passengerTourFlow } from './passenger';
import { profileTourFlow } from './profile';

export const TOUR_FLOWS = {
  home: homeTourFlow,
  profile: profileTourFlow,
  passenger: passengerTourFlow,
  offer: offerTourFlow,
  driverOnboarding: driverOnboardingTourFlow,
  driverPublish: driverPublishTourFlow,
} satisfies Record<string, TourFlow>;

export type TourFlowName = keyof typeof TOUR_FLOWS;

export { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
export type { TourFlow, TourStep } from '../types';
