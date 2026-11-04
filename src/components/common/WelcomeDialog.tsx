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
import getLocalStorage from '@/lib/localStorage';
import { TOUR_STORAGE_KEYS } from '@/modules/tour/constants';
import { notifyTourGateChange } from '@/modules/tour/hooks/use-tour-flow';

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getLocalStorage().getItem(TOUR_STORAGE_KEYS.WELCOME) !== '1');
  }, []);

  const handleClose = () => {
    const ls = getLocalStorage();
    ls.setItem(TOUR_STORAGE_KEYS.WELCOME, '1');
    // Legacy flag read by the travel-form tour gate.
    ls.setItem(TOUR_STORAGE_KEYS.ONBOARDING_LEGACY, '1');
    setOpen(false);
    notifyTourGateChange();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>¡Bienvenido a Carpool It!</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Antes de arrancar, te recomendamos dos cosas para aprovechar mejor
            la app:
          </p>
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
                onClick={handleClose}
                className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                asistencia
              </Link>{' '}
              y sigue los pasos.
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
