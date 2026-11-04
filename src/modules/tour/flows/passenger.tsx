import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';
import {
  travelDateStep,
  travelRouteStep,
  travelSeatsStep,
  travelSwapStep,
} from './travel-steps';

export const passengerTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.PASSENGER,
  steps: [
    travelRouteStep({ tip: true }),
    travelSwapStep,
    travelDateStep('¿Qué día y a qué hora quieres viajar?'),
    travelSeatsStep({
      title: '¿Cuántos asientos necesitas?',
      description: 'Indica cuántas personas viajan contigo.',
    }),
    {
      selectorId: TOUR_STEP_IDS.TRAVEL_FORM_PUBLISH_BUTTON,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            ¡Listo! Has completado tu solicitud
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            ¿Deseas publicar tu viaje ahora?
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
