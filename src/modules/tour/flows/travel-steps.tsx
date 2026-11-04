import type { ReactNode } from 'react';
import { TOUR_STEP_IDS } from '../constants';
import type { TourStep } from '../types';

/**
 * Shared steps for every flow that walks through the new-travel form.
 * Copy lives here once, so a wording change never touches three flows.
 */

function StepCopy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function travelRouteStep({
  tip = false,
}: {
  tip?: boolean;
} = {}): TourStep {
  return {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_ORIGIN,
    position: 'right',
    content: (
      <StepCopy title="Ingresa tu ruta">
        <p className="text-sm leading-6 text-muted-foreground">
          Selecciona tu punto de salida y destino.
        </p>
        {tip && (
          <p className="text-xs text-muted-foreground/70">
            Tip: haz clic en los campos para seleccionar la ubicación.
          </p>
        )}
      </StepCopy>
    ),
  };
}

export const travelSwapStep: TourStep = {
  selectorId: TOUR_STEP_IDS.TRAVEL_FORM_SWAP,
  position: 'right',
  content: (
    <StepCopy title="Ida o vuelta">
      <p className="text-sm leading-6 text-muted-foreground">
        Este botón invierte tu ruta y define el sentido del viaje: si vuelves
        desde la universidad es <strong>vuelta</strong>, si viajas hacia ella es{' '}
        <strong>ida</strong>.
      </p>
    </StepCopy>
  ),
};

export function travelDateStep(question: string): TourStep {
  return {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_DATE,
    position: 'bottom',
    content: (
      <StepCopy title="Elige fecha y hora">
        <p className="text-sm leading-6 text-muted-foreground">{question}</p>
      </StepCopy>
    ),
  };
}

export function travelSeatsStep({
  title,
  description,
}: {
  title: string;
  description: string;
}): TourStep {
  return {
    selectorId: TOUR_STEP_IDS.TRAVEL_FORM_SEATS,
    position: 'left',
    content: (
      <StepCopy title={title}>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </StepCopy>
    ),
  };
}
