import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

/**
 * Desktop onboarding: points at the sidebar entries.
 */
export const onboardingTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.ONBOARDING,
  prompt: {
    title: 'Bienvenido al recorrido',
    description:
      'Haz un recorrido breve para conocer las funciones principales de la aplicación.',
  },
  steps: [
    {
      selectorId: TOUR_STEP_IDS.SIDEBAR_NEW_TRAVEL,
      position: 'right',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Crea o retoma tu viaje
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Usa este acceso para publicar un nuevo viaje o volver rápidamente al
            viaje que ya tienes activo.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.SIDEBAR_HOME,
      position: 'right',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Encuentra opciones</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            En Inicio puedes revisar rutas disponibles, filtrar resultados y
            unirte al viaje que mejor te convenga.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.SIDEBAR_PROFILE,
      position: 'right',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Completa tu perfil</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Mantén tus datos, preferencias y puntos de encuentro actualizados
            para coordinar viajes con más facilidad.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.SIDEBAR_ACCOUNT,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Gestiona tu cuenta</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Desde aquí puedes abrir tu configuración y administrar tu sesión
            cuando lo necesites.
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
