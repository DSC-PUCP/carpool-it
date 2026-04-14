import type { TourStep } from '@/components/tour';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';

export const driverPublishTourSteps = [
  {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_ORIGIN,
    position: 'right' as const,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Ingresa tu ruta</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Selecciona tu punto de salida y destino.
        </p>
        <p className="text-xs text-muted-foreground/70">
          💡 Tip: Haz click en los campos para seleccionar ubicación.
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
          ¿Qué día y a qué hora harás el viaje?
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
    position: 'right' as const,
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
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_PUBLISH,
    position: 'top' as const,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">¡Publica tu viaje!</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Cuando estés listo, publica tu viaje para que pasajeros lo vean.
        </p>
      </div>
    ),
  },
] satisfies TourStep[];
