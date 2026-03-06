import { type ChangeEvent, useState } from 'react';
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
import { processQRScreenshot } from '@/lib/utils';

const MAX_QR_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrUrl: string | null;
  isPending: boolean;
  onSubmit: (file: File) => void;
};

export default function QrPaymentDialog({
  open,
  onOpenChange,
  qrUrl,
  isPending,
  onSubmit,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSelectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFileError(null);
    setSelectedFile(null);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPreviewUrl(null);
      setFileError('Solo se permiten archivos de imagen.');
      return;
    }

    if (file.size > MAX_QR_IMAGE_SIZE_BYTES) {
      setPreviewUrl(null);
      setFileError('La imagen no debe superar 5 MB.');
      return;
    }
    const processedBlob = await processQRScreenshot(file);
    const processedFile = new File(
      [processedBlob.blob],
      `${file.name.split('.')[0]}.webp`,
      {
        type: 'image/webp',
      }
    );
    setSelectedFile(processedFile);
    setPreviewUrl(URL.createObjectURL(processedFile));
  };

  const handleSave = () => {
    if (!selectedFile) return;
    onSubmit(selectedFile);
    onOpenChange(false);
  };

  const currentQr = previewUrl ?? qrUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar QR de Billeteras digitales</DialogTitle>
          <DialogDescription>
            Sube una captura del QR de pago (Yape, Plin, Agora) para mostrarlo
            fácilmente al dejar pasajeros
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="qr-file">Imagen de QR</Label>
          <Input
            id="qr-file"
            type="file"
            accept="image/*"
            onChange={handleSelectFile}
          />
          {fileError ? (
            <p className="text-sm text-destructive">{fileError}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Máximo 5 MB.</p>
          )}
        </div>

        <div className="border rounded-xl p-3 min-h-40 flex items-center justify-center bg-muted/30">
          {currentQr ? (
            <img
              src={currentQr}
              alt="QR de pago"
              className="max-h-72 w-auto rounded-md object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no tienes un QR configurado.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose>Cancelar</DialogClose>
          <Button onClick={handleSave} disabled={!selectedFile || isPending}>
            {isPending ? 'Guardando...' : 'Guardar QR'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
