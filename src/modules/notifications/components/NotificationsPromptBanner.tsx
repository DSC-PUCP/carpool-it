import { useMutation } from '@tanstack/react-query';
import { Bell, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import getLocalStorage from '@/lib/localStorage';
import { PushNotificationsService } from '@/modules/notifications/services';

const DISMISSED_STORAGE_KEY = 'push_prompt_dismissed_v1';

export default function NotificationsPromptBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (getLocalStorage().getItem(DISMISSED_STORAGE_KEY) === '1') return;

    setIsVisible(PushNotificationsService.getPermissionState() === 'default');
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await PushNotificationsService.enable();
      await PushNotificationsService.sync();
    },
    onSuccess: () => {
      setIsVisible(false);
      toast.success('Notificaciones activadas');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (!isVisible) return null;

  const dismiss = () => {
    getLocalStorage().setItem(DISMISSED_STORAGE_KEY, '1');
    setIsVisible(false);
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
      <Bell className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">
          Activa las notificaciones para enterarte de mensajes del viaje
        </p>
        <Button size="sm" onClick={() => mutate()} disabled={isPending}>
          Activar notificaciones
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={dismiss}
        aria-label="Descartar aviso de notificaciones"
      >
        <X />
      </Button>
    </div>
  );
}
