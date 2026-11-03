import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

export const passengerTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.PASSENGER,
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
            ¿Qué día y a qué hora quieres viajar?
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
            ¿Cuántos asientos necesitas?
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Indica cuántas personas viajan contigo.
          </p>
        </div>
      ),
    },
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
