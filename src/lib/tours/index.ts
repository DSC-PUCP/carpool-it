import { driverOnboardingTourSteps } from '@/lib/tours/driver-onboarding-tour';
import { driverPublishTourSteps } from '@/lib/tours/driver-publish-tour';
import { offerTourSteps } from '@/lib/tours/offer-tour';
import { onboardingMobileTourFlow } from '@/lib/tours/onboarding-mobile-tour';
import { onboardingTourFlow } from '@/lib/tours/onboarding-tour';
import { passengerTourSteps } from '@/lib/tours/passenger-tour';

export const TOUR_FLOWS = {
  onboarding: onboardingTourFlow,
  onboardingMobile: onboardingMobileTourFlow,
  passenger: {
    storageKey: 'carpool_passenger_tour_seen',
    steps: passengerTourSteps,
  },
  offer: {
    storageKey: 'carpool_offer_tour_seen',
    steps: offerTourSteps,
  },
  driverOnboarding: {
    storageKey: 'carpool_driver_onboarding_seen',
    steps: driverOnboardingTourSteps,
  },
  driverPublish: {
    storageKey: 'carpool_driver_publish_tour_seen',
    steps: driverPublishTourSteps,
  },
} as const;

export type TourFlowName = keyof typeof TOUR_FLOWS;
