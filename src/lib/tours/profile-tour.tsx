import type { TourStep } from '@/components/tour';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';

export const profileTourSteps = [
  {
    selectorId: TOUR_STEP_IDS.PROFILE_HEADER,
    position: 'bottom' as const,
    modalWidth: 340,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Este es tu perfil</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Aqu&iacute; ves tu foto, nombre, correo y el tag con el que otros
          usuarios pueden reconocerte m&aacute;s r&aacute;pido.
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.PROFILE_EDIT_TAG,
    position: 'bottom' as const,
    modalWidth: 320,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Personaliza tu tag</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Usa este bot&oacute;n para elegir un tag corto y f&aacute;cil de
          compartir dentro de la app.
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.PROFILE_STATS,
    position: 'bottom' as const,
    modalWidth: 340,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Sigue tu actividad</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Estas tarjetas resumen tu rating, la cantidad de viajes realizados y
          el impacto positivo que has generado.
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.PROFILE_LOCATIONS,
    position: 'bottom' as const,
    modalWidth: 340,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">
          Guarda tus ubicaciones
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Desde aqu&iacute; puedes registrar tus puntos frecuentes para llenar
          rutas m&aacute;s r&aacute;pido.
        </p>
      </div>
    ),
  },
  {
    selectorId: TOUR_STEP_IDS.PROFILE_SUPPORT,
    position: 'top' as const,
    modalWidth: 340,
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Encuentra ayuda</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Si tienes dudas sobre c&oacute;mo usar Carpool.it, esta secci&oacute;n
          te lleva a respuestas frecuentes y soporte.
        </p>
      </div>
    ),
  },
] satisfies TourStep[];
