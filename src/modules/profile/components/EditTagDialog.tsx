import { DialogClose } from '@radix-ui/react-dialog';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUpdateTag } from '../hooks/useUpdateTag';

export default function EditTagDialog() {
  const { mutate, isPending } = useUpdateTag();
  const [tag, setTag] = useState('');
  const [open, setOpen] = useState(false);

  const onSave = () => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    mutate(trimmed, {
      onSuccess: () => {
        toast.success('Tag actualizado correctamente');
        setOpen(false);
        setTag('');
      },
      onError: (_error) => {
        toast.error('Ese tag ya está en uso, por favor elige otro.');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2">
          <Edit />
          Editar tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tag</DialogTitle>
        </DialogHeader>
        <div>
          <Input
            placeholder="Nuevo tag"
            maxLength={15}
            minLength={3}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={onSave} disabled={isPending || !tag.trim()}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
