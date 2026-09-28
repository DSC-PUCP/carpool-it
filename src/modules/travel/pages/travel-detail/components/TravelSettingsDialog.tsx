import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

type TravelSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: boolean;
  allow: boolean;
  isPending: boolean;
  onActiveChange: (active: boolean) => void;
  onAllowChange: (allow: boolean) => void;
};

export default function TravelSettingsDialog({
  open,
  onOpenChange,
  active,
  allow,
  isPending,
  onActiveChange,
  onAllowChange,
}: TravelSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Configuración del viaje"
        >
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración del viaje</DialogTitle>
          <DialogDescription>
            Controla la visibilidad del viaje y si puede recibir nuevos
            integrantes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Privado</span>
            <Switch
              checked={!active}
              disabled={isPending}
              onCheckedChange={(checked) => onActiveChange(!checked)}
              aria-label="Hacer viaje privado"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Aceptar integrantes</span>
            <Switch
              checked={allow}
              disabled={isPending}
              onCheckedChange={onAllowChange}
              aria-label="Aceptar nuevos integrantes"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
