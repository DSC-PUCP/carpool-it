import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

/**
 * Mobile onboarding: points at the bottom navbar entries.
 */
export const onboardingMobileTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.ONBOARDING,
  prompt: {
    title: 'Bienvenido al recorrido',
    description:
      'Haz un recorrido breve para conocer las funciones principales de la aplicación.',
  },
  steps: [
    {
      selectorId: TOUR_STEP_IDS.NAVBAR_NEW_TRAVEL,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Publica tu viaje</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Este botón central te lleva directo a crear un viaje nuevo o retomar
            el que ya tienes activo.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.NAVBAR_HOME,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Explora opciones</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Desde Inicio puedes revisar rutas disponibles y encontrar el viaje
            que mejor te convenga.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.NAVBAR_PROFILE,
      position: 'top',
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Ajusta tu perfil</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Aquí puedes completar tus datos y mantener tus preferencias al día
            para coordinar mejor tus viajes.
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
