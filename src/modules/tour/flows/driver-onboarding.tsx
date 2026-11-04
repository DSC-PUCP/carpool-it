import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

export const driverOnboardingTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.DRIVER_ONBOARDING,
  steps: [
    {
      selectorId: TOUR_STEP_IDS.ROLE_SELECTOR_OFFER,
      position: 'right',
      shouldReload: true,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            ¡Bienvenido conductor!
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Haz clic en "Ofrece un viaje" y completa el formulario para
            registrar tu vehículo.
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
