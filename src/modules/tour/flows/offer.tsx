import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';
import {
  travelDateStep,
  travelRouteStep,
  travelSeatsStep,
  travelSwapStep,
} from './travel-steps';

export const offerTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.OFFER,
  steps: [
    travelRouteStep(),
    travelSwapStep,
    travelDateStep('¿Qué día y a qué hora realizarás el viaje?'),
    travelSeatsStep({
      title: '¿Cuántos asientos disponibles?',
      description: 'Indica cuántos pasajeros puedes llevar.',
    }),
    {
      selectorId: TOUR_STEP_IDS.TRAVEL_FORM_PUBLISH_BUTTON,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            ¡Listo! Has completado tu publicación
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            ¿Deseas publicar tu viaje ahora?
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
