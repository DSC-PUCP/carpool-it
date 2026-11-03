import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

export const driverPublishTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.DRIVER_PUBLISH,
  steps: [
    {
      selectorId: TOUR_STEP_IDS.TRAVEL_FORM_ORIGIN,
      position: 'right',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Ingresa tu ruta</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Selecciona tu punto de salida y destino.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Tip: haz clic en los campos para seleccionar la ubicación.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.TRAVEL_FORM_DATE,
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Elige fecha y hora</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            ¿Qué día y a qué hora harás el viaje?
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.TRAVEL_FORM_SEATS,
      position: 'left',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            ¿Cuántos asientos tienes?
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Indica cuántos pasajeros puedes llevar.
          </p>
        </div>
      ),
    },
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
