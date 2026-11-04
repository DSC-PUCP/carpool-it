import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

export const profileTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.PROFILE,
  steps: [
    {
      selectorId: TOUR_STEP_IDS.PROFILE_HEADER,
      position: 'bottom',
      modalWidth: 340,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Este es tu perfil</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Aquí ves tu foto, nombre, correo y el tag con el que otros usuarios
            pueden reconocerte más rápido.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.PROFILE_EDIT_TAG,
      position: 'bottom',
      modalWidth: 320,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Personaliza tu tag</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Usa este botón para elegir un tag corto y fácil de compartir dentro
            de la app.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.PROFILE_STATS,
      position: 'bottom',
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
      position: 'bottom',
      modalWidth: 340,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Guarda tus ubicaciones
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Desde aquí puedes registrar tus puntos frecuentes para llenar rutas
            más rápido.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.PROFILE_SUPPORT,
      position: 'top',
      modalWidth: 340,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Encuentra ayuda</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Si tienes dudas sobre cómo usar Carpool.it, esta sección te lleva a
            respuestas frecuentes y soporte.
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
