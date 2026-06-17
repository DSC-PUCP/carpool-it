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
import { useTourFlow } from '@/hooks/use-tour-flow';
import getLocalStorage from '@/lib/localStorage';

const ONBOARDING_COMPLETED_KEY = 'carpool_onboarding_completed';

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { shouldPrompt, startFlow, skipFlow } = useTourFlow(
    isMobile ? 'onboardingMobile' : 'onboarding'
  );

  useEffect(() => {
    setOpen(shouldPrompt);
  }, [shouldPrompt]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          skipFlow();
          setOpen(false);
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
              Revisar la sección de{' '}
              <Link
                to="/profile/asisstance"
                onClick={() => {
                  skipFlow();
                  setOpen(false);
                }}
                className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                Asistencia
              </Link>{' '}
              si quieres resolver dudas frecuentes.
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              const ls = getLocalStorage();
              ls.setItem(ONBOARDING_COMPLETED_KEY, '1');
              skipFlow();
              setOpen(false);
            }}
            variant="outline"
          >
            Ahora no
          </Button>
          <Button
            onClick={() => {
              const ls = getLocalStorage();
              ls.setItem(ONBOARDING_COMPLETED_KEY, '1');
              setOpen(false);
              startFlow();
            }}
          >
            Iniciar recorrido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
