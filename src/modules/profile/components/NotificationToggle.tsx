import { useMutation } from '@tanstack/react-query';
import { Bell, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PushNotificationsService } from '@/modules/notifications/services';

export default function NotificationToggle() {
  const [permission, setPermission] =
    useState<NotificationPermission>('default');

  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermission(Notification.permission);
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await PushNotificationsService.requestPermission();
      await PushNotificationsService.syncDeviceToken();
    },
    onSuccess: () => {
      setPermission('granted');
      toast.success('Notificaciones activadas');
    },
    onError: (error: Error) => {
      if (error.message.includes('Bloqueaste')) {
        toast.error(
          'Bloqueaste las notificaciones. Habilitalas desde la configuracion de tu navegador.'
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  if (!('Notification' in window)) return null;

  const isEnabled = permission === 'granted';

  const handleClick = () => {
    if (isEnabled) return;
    if (permission === 'denied') {
      toast.error(
        'Bloqueaste las notificaciones. Habilitalas desde la configuracion de tu navegador.'
      );
      return;
    }
    mutate();
  };

  return (
    <Button
      variant={isEnabled ? 'default' : 'outline'}
      size="default"
      onClick={handleClick}
      disabled={isPending}
      className="mt-2"
    >
      {isEnabled ? <Bell /> : <BellOff />}
      {isEnabled ? 'Notificaciones' : 'Activar notificaciones'}
    </Button>
  );
}
