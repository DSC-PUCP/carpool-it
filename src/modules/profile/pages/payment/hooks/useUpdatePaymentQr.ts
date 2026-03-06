import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useUpdatePaymentQr = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; file: File }) =>
      ProfileService.updatePaymentQr(params),
    onSuccess: () => {
      toast.success('QR de pago actualizado correctamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el QR de pago');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYMENTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VEHICLE] });
    },
  });
};

export const useUpdateMetamaskWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; walletAddress: string }) =>
      ProfileService.updateMetamaskWallet(params),
    onSuccess: () => {
      toast.success('Dirección de Metamask actualizada correctamente');
    },
    onError: (error) => {
      toast.error(
        error.message || 'Error al actualizar la dirección de Metamask'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYMENTS] });
    },
  });
};
