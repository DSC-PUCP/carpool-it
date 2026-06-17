import type { TourStep } from '@/components/tour';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';

export const offerTourSteps = [
  {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_ORIGIN,
    position: 'right' as const,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Ingresa tu ruta</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Selecciona tu punto de salida y destino.
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_DATE,
    position: 'bottom' as const,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Elige fecha y hora</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          ¿Qué día y a qué hora realizarás el viaje?
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_SEATS,
    position: 'left' as const,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">
          ¿Cuántos asientos disponibles?
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Indica cuántos pasajeros puedes llevar.
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_PUBLISH,
    position: 'top' as const,
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
] satisfies TourStep[];
