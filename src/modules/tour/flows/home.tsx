import { TOUR_STEP_IDS, TOUR_STORAGE_KEYS } from '../constants';
import type { TourFlow } from '../types';

export const homeTourFlow = {
  storageKey: TOUR_STORAGE_KEYS.HOME,
  requires: 'welcome',
  steps: [
    {
      selectorId: TOUR_STEP_IDS.HOME_DIRECTION,
      position: 'bottom',
      modalWidth: 320,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Elige viajes que lleguen o salgan de la universidad
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Cambia la dirección para ver únicamente los viajes que van al campus
            o los que salen de él.
          </p>
        </div>
      ),
    },
    {
      selectorId: TOUR_STEP_IDS.HOME_FEED,
      position: 'bottom',
      modalWidth: 320,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Visualiza y filtra los viajes
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Filtra por fecha, hora, ubicación o viajes asignados. Si buscas algo
            fijo, revisa los viajes recurrentes.
          </p>
        </div>
      ),
    },
    {
      selectorId: [
        { id: TOUR_STEP_IDS.NAVBAR_NEW_TRAVEL, position: 'top' },
        { id: TOUR_STEP_IDS.SIDEBAR_NEW_TRAVEL, position: 'right' },
      ],
      position: 'top',
      modalWidth: 320,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Solicita u ofrece un nuevo viaje
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Desde aquí publicas lo que necesitas: pide un asiento o comparte los
            que tienes libres en tu auto.
          </p>
        </div>
      ),
    },
    {
      selectorId: [
        { id: TOUR_STEP_IDS.NAVBAR_PROFILE, position: 'top' },
        { id: TOUR_STEP_IDS.SIDEBAR_PROFILE, position: 'right' },
      ],
      position: 'top',
      modalWidth: 320,
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Configura tu perfil y revisa tu asistencia
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Completa tus datos, guarda tus ubicaciones frecuentes y consulta tu
            asistencia a los viajes desde tu perfil.
          </p>
        </div>
      ),
    },
  ],
} satisfies TourFlow;
