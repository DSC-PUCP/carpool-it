import Typography from '@/components/typography';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

type Props = {
  willTransferOwnership: boolean;
  isLoading: boolean;
  handleLeave: () => void;
};
export default function QuitDialog({
  willTransferOwnership,
  isLoading,
  handleLeave,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex-1 h-12 py-2" variant="destructive">
          <Typography variant="large">Salir del viaje</Typography>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            {willTransferOwnership
              ? 'Al salir, la propiedad del viaje pasará al siguiente pasajero.'
              : 'Saldrás de este viaje.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleLeave}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Salir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
