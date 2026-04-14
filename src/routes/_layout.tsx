import { useMutation } from '@tanstack/react-query';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import AppSidebar from '@/components/common/AppSidebar';
import WelcomeDialog from '@/components/common/WelcomeDialog';
import AppLayout from '@/components/layout/AppLayout';
import GlowBackground from '@/components/layout/glow-background/GlowBackground';
import { TourProvider } from '@/components/tour';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryKeys } from '@/const/query-keys';
import { AuthService } from '@/modules/auth/services';
import { ProfileService } from '@/modules/profile/services';
import { TravelService } from '@/modules/travel/services';

export const Route = createFileRoute('/_layout')({
  beforeLoad: async ({ context: { user, queryClient } }) => {
    if (!user?.email)
      return {
        profileData: null,
        locationsData: null,
        activeRide: null,
        vehicleData: null,
      };
    const profileData = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.PROFILE],
      queryFn: () => ProfileService.getProfile(user.id),
    });
    const locationsData = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.LOCATIONS],
      queryFn: () => ProfileService.getLocations(user.id),
    });
    const activeRide = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.ACTIVE_RIDE],
      queryFn: () => TravelService.getActiveRideForUser(user.id),
    });
    if (!profileData.isDriver)
      return { profileData, locationsData, vehicleData: null, activeRide };
    const vehicleData = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.VEHICLE],
      queryFn: () => ProfileService.getVehicle(user.id),
    });
    return { profileData, locationsData, vehicleData, activeRide };
  },
  component: () => {
    const navigate = useNavigate();
    const { user } = Route.useRouteContext();
    const { mutate } = useMutation({
      mutationFn: AuthService.logout,
      onSuccess: () => navigate({ to: '/sign-in' }),
    });

    const handleTourComplete = (shouldReload: boolean) => {
      if (shouldReload) {
        window.location.reload();
      }
    };

    return (
      <SidebarProvider>
        <TourProvider onComplete={handleTourComplete}>
          {user && <AppSidebar {...user} onLogout={mutate} />}
          {user && <WelcomeDialog />}
          <GlowBackground>
            <AppLayout>
              <Outlet />
            </AppLayout>
          </GlowBackground>
        </TourProvider>
      </SidebarProvider>
    );
  },
});
