import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { QueryKeys } from '@/const/query-keys';
import type { DriverVehicle } from '@/core/models';
import { ProfileService } from '@/modules/profile/services';

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  const { user } = useRouteContext({ from: '/_layout' });

  return useMutation({
    mutationFn: (vehicle: Omit<DriverVehicle, 'qrUrl' | 'walletAddress'>) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return ProfileService.updateVehicle({
        userId: user.id,
        vehicle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.VEHICLE] });
    },
  });
};
