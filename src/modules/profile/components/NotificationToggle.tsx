import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  PushNotificationsService,
  type PushPermissionState,
} from '@/modules/notifications/services';

const IOS_INSTALL_MESSAGE =
  'En Safari toca Compartir y luego "Agregar a pantalla de inicio". Abre Carpool It desde ahí y vuelve a activar las notificaciones.';

const DENIED_MESSAGE =
  'Bloqueaste las notificaciones. Habilítalas desde la configuración del sitio en tu navegador y recarga la página.';

export default function NotificationToggle() {
  const [permission, setPermission] = useState<PushPermissionState | null>(
    null
  );

  useEffect(() => {
    setPermission(PushNotificationsService.getPermissionState());
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await PushNotificationsService.enable();
      await PushNotificationsService.sync();
    },
    onSuccess: () => {
      setPermission(PushNotificationsService.getPermissionState());
      toast.success('Notificaciones activadas');
    },
    onError: (error: Error) => {
      setPermission(PushNotificationsService.getPermissionState());
      toast.error(error.message);
    },
  });

  if (!permission || permission === 'unsupported') return null;

  if (permission === 'ios-needs-install') {
    return (
      <Button asChild variant="outline" size="default" className="mt-2">
        <Link
          to="/profile/asisstance"
          hash="agregar-a-pantalla-de-inicio"
          title={IOS_INSTALL_MESSAGE}
        >
          <Smartphone />
          Activar notificaciones
        </Link>
      </Button>
    );
  }

  if (permission === 'denied') {
    return (
      <Button
        variant="outline"
        size="default"
        className="mt-2"
        onClick={() =>
          toast.error('Notificaciones bloqueadas', {
            description: DENIED_MESSAGE,
          })
        }
      >
        <BellOff />
        Notificaciones bloqueadas
      </Button>
    );
  }

  if (permission === 'granted' || permission === 'default') {
    return (
      <div className="mt-2 flex items-center gap-2">
        <Bell className="size-4" />
        <span className="text-sm font-medium">Notificaciones</span>
        <Switch
          checked={permission === 'granted'}
          onCheckedChange={() => mutate()}
          disabled={isPending}
          aria-label="Activar o reparar notificaciones"
        />
      </div>
    );
  }

  return null;
}
