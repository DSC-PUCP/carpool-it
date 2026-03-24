import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/const/query-keys';
import { ProfileService } from '@/modules/profile/services';

export const useDriverPayments = (driverId?: string) => {
  return useQuery({
    queryKey: [QueryKeys.PAYMENTS, driverId],
    queryFn: async () => {
      try {
        return await ProfileService.getPayments(driverId as string);
      } catch {
        return {
          qrUrl: null,
          metamaskAddress: null,
        };
      }
    },
    enabled: !!driverId,
    retry: false,
  });
};
