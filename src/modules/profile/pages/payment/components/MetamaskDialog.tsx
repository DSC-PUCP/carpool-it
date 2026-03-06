import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  walletAddress: z
    .string('La dirección es obligatoria')
    .trim()
    .regex(/^(0x)?[a-fA-F0-9]{40}$/, 'Dirección de wallet inválida'),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
  isPending: boolean;
  onSubmit: (walletAddress: string) => void;
};

export default function MetamaskDialog({
  open,
  onOpenChange,
  walletAddress,
  isPending,
  onSubmit,
}: Props) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: walletAddress ?? '',
    },
  });

  useEffect(() => {
    form.reset({ walletAddress: walletAddress ?? '' });
  }, [walletAddress, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data.walletAddress);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Billetera Blockchain</DialogTitle>
          <DialogDescription>
            Guarda tu dirección pública para recibir pagos en <i>stablecoins</i>
            , criptomonedas o tokens en blockchain
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="wallet-address">Dirección wallet</Label>
          <Input
            id="wallet-address"
            placeholder="0x..."
            {...form.register('walletAddress')}
          />
          {form.formState.errors.walletAddress && (
            <p className="text-sm text-destructive">
              {form.formState.errors.walletAddress.message}
            </p>
          )}
        </form>

        <DialogFooter>
          <DialogClose>Cancelar</DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar dirección'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
