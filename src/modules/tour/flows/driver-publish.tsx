import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';
import {
  travelDateStep,
  travelRouteStep,
  travelSeatsStep,
  travelSwapStep,
} from './travel-steps';

export const driverPublishTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.DRIVER_PUBLISH,
  steps: [
    travelRouteStep({ tip: true }),
    travelSwapStep,
    travelDateStep('¿Qué día y a qué hora harás el viaje?'),
    travelSeatsStep({
      title: '¿Cuántos asientos tienes?',
      description: 'Indica cuántos pasajeros puedes llevar.',
    }),
    {
      selectorId: TOUR_STEP_IDS.OFFER_FORM_CONTRIBUTION,
      position: 'right',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Define tu contribución
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Establece cuánto cobrarás por cada pasajero.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.TRAVEL_FORM_PUBLISH_BUTTON,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">¡Publica tu viaje!</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Cuando estés listo, publica tu viaje para que los pasajeros lo vean.
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
