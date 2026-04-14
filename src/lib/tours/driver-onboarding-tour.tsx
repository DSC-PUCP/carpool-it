import type { TourStep } from '@/components/tour';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';

export const driverOnboardingTourSteps = [
  {
    selectorId: TOUR_STEP_IDS.ROLE_SELECTOR_OFFER,
    position: 'right' as const,
    shouldReload: true,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">
          ¡Bienvenido conductor!
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Haz click en "Ofrece un viaje" y completa el formulario para registrar
          tu vehículo.
        </p>
      </div>
    ),
  },
] satisfies TourStep[];
