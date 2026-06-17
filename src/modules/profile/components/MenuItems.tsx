import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Car,
  ChevronRight,
  CircleHelp,
  CreditCard,
  LogOut,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { AuthService } from '@/modules/auth/services';

export default function MenuItems() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => navigate({ to: '/sign-in' }),
  });

  return (
    <div className="px-4 flex flex-col gap-3 mb-8">
      {/* Vehicle - Only if Driver */}
      {profileData?.isDriver && (
        <Button
          variant="outline"
          className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
          onClick={() =>
            navigate({
              to: '/profile/vehicle',
              viewTransition: { types: ['slide-left'] },
            })
          }
        >
          <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-base font-bold truncate">Vehículo</p>
            <p className="text-muted-foreground text-sm truncate">
              Administra tu auto
            </p>
          </div>
          <div className="shrink-0 text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Button>
      )}

      {/* Locations */}
      <Button
        variant="outline"
        id={TOUR_STEP_IDS.PROFILE_LOCATIONS}
        className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
        onClick={() =>
          navigate({
            to: '/profile/locations',
            viewTransition: { types: ['slide-left'] },
          })
        }
      >
        <div className="flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-base font-bold truncate">Ubicaciones</p>
          <p className="text-muted-foreground text-sm truncate">
            Tus lugares guardados
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
      </Button>

      {/* Recurring Trips */}

      {profileData?.isDriver && (
        <Button
          variant="outline"
          className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
          onClick={() =>
            navigate({
              to: '/profile/payments',
              viewTransition: { types: ['slide-left'] },
            })
          }
        >
          <div className="flex items-center justify-center rounded-xl bg-primary/10 text-primary w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-base font-bold truncate">Pagos</p>
            <p className="text-muted-foreground text-sm truncate">
              Configura tu método de recibo de pagos
            </p>
          </div>
          <div className="shrink-0 text-muted-foreground">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Button>
      )}

      <Button
        variant="outline"
        id={TOUR_STEP_IDS.PROFILE_SUPPORT}
        className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group"
        onClick={() =>
          navigate({
            to: '/profile/asisstance',
            viewTransition: { types: ['slide-left'] },
          })
        }
      >
        <div className="flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
          <CircleHelp className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-base font-bold truncate">Asistencia</p>
          <p className="text-muted-foreground text-sm truncate">
            Preguntas frecuentes y ayuda
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </div>
      </Button>

      {/* Cerrar sesión */}
      <Button
        variant="outline"
        className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-filter backdrop-blur-sm h-auto justify-start text-left group border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={() => logout()}
        disabled={isLoggingOut}
      >
        <div className="flex items-center justify-center rounded-xl bg-destructive/10 text-destructive w-12 h-12 shrink-0 group-hover:scale-110 transition-transform">
          <LogOut className="w-5 h-5" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-base font-bold truncate">Cerrar sesión</p>
          <p className="text-muted-foreground text-sm truncate">
            Salir de tu cuenta
          </p>
        </div>
      </Button>
    </div>
  );
}
