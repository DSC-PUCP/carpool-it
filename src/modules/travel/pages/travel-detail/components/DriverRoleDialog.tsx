import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RideRole } from '@/core/models';

type DriverRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (role: RideRole) => void;
  isPending: boolean;
};

export default function DriverRoleDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DriverRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unirse al viaje</DialogTitle>
          <DialogDescription>
            ¿Deseas asignarte como conductor del viaje?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={() => onConfirm('passenger')}
          >
            No, como pasajero
          </Button>
          <Button
            className="flex-1"
            disabled={isPending}
            onClick={() => onConfirm('driver')}
          >
            Sí, como conductor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
