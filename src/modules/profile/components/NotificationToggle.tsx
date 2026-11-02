import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

  if (permission === 'granted') {
    return (
      <div className="mt-2 flex items-center gap-2">
        <Button variant="secondary" disabled>
          <Bell />
          Activadas
        </Button>
        <Button
          variant="ghost"
          onClick={() => mutate()}
          disabled={isPending}
          title="Vuelve a registrar este dispositivo por si el registro falló"
        >
          Reparar
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="default"
      onClick={() => mutate()}
      disabled={isPending}
      className="mt-2"
    >
      <Bell />
      Activar notificaciones
    </Button>
  );
}
