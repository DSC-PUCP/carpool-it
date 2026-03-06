import { Link, useRouteContext } from '@tanstack/react-router';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import metamaskImage from '@/assets/images/payment-metamask.webp';
import qrImage from '@/assets/images/payment-qr.webp';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import { Card } from '@/components/ui/card';
import MetamaskDialog from './components/MetamaskDialog';
import QrPaymentDialog from './components/QrPaymentDialog';
import { usePayments } from './hooks/usePayments';
import {
  useUpdateMetamaskWallet,
  useUpdatePaymentQr,
} from './hooks/useUpdatePaymentQr';

export default function Payments() {
  const { user } = useRouteContext({ from: '/_layout/_auth/profile/payments' });
  const { data: payments } = usePayments();
  const { mutate: updatePaymentQr, isPending: isUpdatingQr } =
    useUpdatePaymentQr();
  const { mutate: updateMetamaskWallet, isPending: isUpdatingMetamask } =
    useUpdateMetamaskWallet();

  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isMetamaskDialogOpen, setIsMetamaskDialogOpen] = useState(false);

  const onSaveQr = (file: File) => {
    updatePaymentQr({
      userId: user.id,
      file,
    });
  };

  const onSaveMetamask = (walletAddress: string) => {
    updateMetamaskWallet({
      userId: user.id,
      walletAddress,
    });
  };

  return (
    <div className="flex-1 [view-transition-name:main-content]">
      <TopStack>
        <TopStackAction>
          <Link to=".." viewTransition={{ types: ['slide-right'] }}>
            <ArrowLeft />
          </Link>
        </TopStackAction>
        <TopStackTitle>Pagos</TopStackTitle>
        <TopStackAction />
      </TopStack>

      <main className="overflow-y-auto p-4 space-y-4">
        <Card className="overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center p-4 gap-4 text-left"
            onClick={() => setIsQrDialogOpen(true)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <img
                src={qrImage}
                alt="QR"
                className="h-6 w-6 rounded-sm object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">Billeteras Digitales</h3>
              <p className="text-sm text-muted-foreground truncate">
                {payments?.qrUrl ? 'Configurado' : 'No configurado'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </Card>

        <Card className="overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center p-4 gap-4 text-left"
            onClick={() => setIsMetamaskDialogOpen(true)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <img
                src={metamaskImage}
                alt="Metamask"
                className="h-6 w-6 rounded-sm object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">Blockchain</h3>
              <p className="text-sm text-muted-foreground truncate">
                {payments?.metamaskAddress ? 'Configurado' : 'No configurado'}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </Card>

        <QrPaymentDialog
          open={isQrDialogOpen}
          onOpenChange={setIsQrDialogOpen}
          qrUrl={payments?.qrUrl}
          isPending={isUpdatingQr}
          onSubmit={onSaveQr}
        />

        <MetamaskDialog
          open={isMetamaskDialogOpen}
          onOpenChange={setIsMetamaskDialogOpen}
          walletAddress={payments?.metamaskAddress}
          isPending={isUpdatingMetamask}
          onSubmit={onSaveMetamask}
        />
      </main>
    </div>
  );
}
