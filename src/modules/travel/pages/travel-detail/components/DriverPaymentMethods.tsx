import { Copy, QrCode, Wallet } from 'lucide-react';
import QRCodeImport from 'react-qr-code';
import { toast } from 'sonner';
import Typography from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDriverPayments } from '../hooks/useDriverPayments';

const QRCode =
  (QRCodeImport as { default?: typeof QRCodeImport }).default ?? QRCodeImport;

type DriverPaymentMethodsProps = {
  driverId?: string;
  fallbackQrUrl?: string | null;
  imageSize?: 'sm' | 'md';
};

export default function DriverPaymentMethods({
  driverId,
  fallbackQrUrl,
  imageSize = 'md',
}: DriverPaymentMethodsProps) {
  const { data: payments } = useDriverPayments(driverId);

  const qrUrl = payments?.qrUrl ?? fallbackQrUrl ?? null;
  const walletAddress = payments?.metamaskAddress ?? null;
  const hasQr = !!qrUrl;
  const hasWallet = !!walletAddress;
  const imageClassName =
    imageSize === 'sm'
      ? 'h-48 w-48 rounded-md object-contain'
      : 'h-64 w-64 rounded-md object-contain';
  const walletQrSize = imageSize === 'sm' ? 176 : 224;

  const handleCopyWallet = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    toast.success('Billetera copiada');
  };

  if (!hasQr && !hasWallet) return null;
  return (
    <div className="space-y-3">
      <Typography variant="muted">Métodos de pago del conductor</Typography>
      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr">
            <QrCode className="size-4" />
            Yape / Plin
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet className="size-4" />
            Blockchain
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="pt-4">
          {hasQr ? (
            <div className="rounded-lg border p-3 flex justify-center bg-muted/20">
              <img
                src={qrUrl}
                alt="QR de pago del conductor"
                className={imageClassName}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              El conductor no configuró un QR para Yape o Plin.
            </p>
          )}
        </TabsContent>

        <TabsContent value="wallet" className="pt-4">
          {hasWallet ? (
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex justify-center rounded-lg bg-white p-4">
                <QRCode
                  value={walletAddress}
                  size={walletQrSize}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <p className="break-all text-sm text-muted-foreground">
                {walletAddress}
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCopyWallet}
              >
                <Copy className="size-4" />
                Copiar dirección
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              El conductor no configuró una billetera blockchain.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
