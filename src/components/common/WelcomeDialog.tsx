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

const WELCOME_KEY = 'carpool_welcome_shown';

export default function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ls = getLocalStorage();
    if (!ls.getItem(WELCOME_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    const ls = getLocalStorage();
    ls.setItem(WELCOME_KEY, '1');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¡Gracias por unirte a Carpool It! 🚀</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>Para una mejor experiencia:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Únete a los grupos de WhatsApp a través de{' '}
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
              Lee la sección de{' '}
              <Link
                to="/profile/asisstance"
                onClick={handleClose}
                className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-80"
              >
                Asistencia
              </Link>{' '}
              para resolver tus dudas.
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
