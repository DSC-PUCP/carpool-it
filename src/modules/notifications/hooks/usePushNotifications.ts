import { useMutation } from '@tanstack/react-query';
import { PushNotificationsService } from '@/modules/notifications/services';

export const usePushNotifications = () => {
  return useMutation({
    mutationFn: PushNotificationsService.syncDeviceToken,
  });
};
