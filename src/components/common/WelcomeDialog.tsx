import { Link } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import getLocalStorage from '@/lib/localStorage';
import { TOUR_STORAGE_KEYS } from '@/modules/tour/constants';
import { useTourFlow } from '@/modules/tour/hooks/use-tour-flow';

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { shouldPrompt, startFlow, skipFlow } = useTourFlow(
    isMobile ? 'onboardingMobile' : 'onboarding'
  );

  useEffect(() => {
    setOpen(shouldPrompt);
  }, [shouldPrompt]);

  const handleStart = () => {
    // Legacy flag read by the travel-form tour gate.
    getLocalStorage().setItem(TOUR_STORAGE_KEYS.ONBOARDING_LEGACY, '1');
    setOpen(false);
    startFlow();
  };

  const handleSkip = () => {
    getLocalStorage().setItem(TOUR_STORAGE_KEYS.ONBOARDING_LEGACY, '1');
    skipFlow();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleSkip();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>¡Bienvenido a Carpool It!</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Te dejamos un recorrido corto para ubicar lo principal y empezar a
            usar la app sin perder tiempo.
          </p>
          <p>Antes de arrancar, te recomendamos:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Unirte a los grupos de WhatsApp a través de{' '}
              <a
                href="https://forms.gle/vYLeDmHUxX3Z73oC6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                este formulario
                <ExternalLink className="size-3" />
              </a>
              .
            </li>
            <li>
              Instala o agrega la app a tu celular desde{' '}
              <Link
                to="/profile/asisstance"
                hash="agregar-a-pantalla-de-inicio"
                onClick={handleSkip}
                className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                asistencia
              </Link>{' '}
              y sigue los pasos.
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={handleSkip} variant="outline">
            Ahora no
          </Button>
          <Button onClick={handleStart}>Iniciar recorrido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
