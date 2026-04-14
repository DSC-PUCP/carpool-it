import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { CircleAlert, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NotFound from '@/components/common/NotFound';
import Typography from '@/components/typography';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { QueryKeys } from '@/const/query-keys';
import { useLocations } from '@/hooks/use-locations';
import { useProfile } from '@/hooks/use-profile';
import { AuthService } from '@/modules/auth/services';
import { ProfileService } from '@/modules/profile/services';
import RideCard from '../../components/ride-card/RideCard';
import DefaultLocationDialog from './components/DefaultLocationDialog';
import DriverPaymentMethods from './components/DriverPaymentMethods';
import DriverRoleDialog from './components/DriverRoleDialog';
import NextStepDialog from './components/NextStepDialog';
import QuitDialog from './components/QuitDialog';
import TravelChat from './components/TravelChat';
import { useJoinRide } from './hooks/useJoinRide';
import { useLeaveRide } from './hooks/useLeaveRide';
import { hasRatedDriver, useRateDriver } from './hooks/useRateDriver';
import { useTravelDetail } from './hooks/useTravelDetail';
import {
  buildJoinRideInput,
  canCurrentUserRateDriver,
  getDefaultLocationForProfile,
  getDriverPaymentState,
  getOwnerTransferCandidate,
  getSeatRecommendationForMember,
  getTravelParticipationState,
  type JoinRideRole,
  shouldPromptForDriverRoleSelection,
} from './utils';

export default function TravelDetail() {
  const navigate = useNavigate();
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [isDriverRoleDialogOpen, setIsDriverRoleDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(0);
  const [hoveredRate, setHoveredRate] = useState(0);
  const queryClient = useQueryClient();
  const { data: travel } = useTravelDetail();
  const { mutate: joinRide, isPending: isJoining } = useJoinRide();
  const { mutate: leaveRide, isPending: isLeaving } = useLeaveRide();
  const { user } = useRouteContext({ from: '/_layout/_public/travel/$id' });
  const { data: profile } = useProfile();
  const { data: locations } = useLocations();
  const { mutate: rateDriver, isPending: isRating } = useRateDriver(
    travel?.id ?? '',
    user?.id ?? ''
  );
  const { mutate: createLocation, isPending: isSavingLocation } = useMutation({
    mutationFn: ProfileService.addLocation,
    onError: (error) => {
      toast.error(error.message || 'Error al guardar ubicación');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LOCATIONS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROFILE] });
      setIsLocationDialogOpen(false);
      toast.success('Ubicación predeterminada guardada');
    },
  });

  if (!travel) return <NotFound />;

  const { isMember, isOwner, isPassenger } = getTravelParticipationState(
    travel,
    user
  );
  const seatRecommendation = getSeatRecommendationForMember(
    travel,
    user,
    isMember
  );
  const { driverQrUrl, driverUserId, hasDriverPaymentMethods } =
    getDriverPaymentState(travel);
  const canRateDriver = canCurrentUserRateDriver({
    travel,
    user,
    isMember,
    isPassenger,
    hasRatedDriver,
  });
  const locationPrompt =
    travel.direction === 'to_campus'
      ? 'Elige tu zona de recojo'
      : 'Elige tu destino';
  const hasMultipleParticipants = travel.stops.length > 1;

  const handleJoin = () => {
    if (!user) return;

    const defaultLocation = getDefaultLocationForProfile(profile, locations);
    if (!defaultLocation) {
      setIsLocationDialogOpen(true);
      return;
    }

    if (shouldPromptForDriverRoleSelection(profile)) {
      setIsDriverRoleDialogOpen(true);
      return;
    }

    joinWithRole('passenger');
  };

  const joinWithRole = (role: JoinRideRole) => {
    if (!user) return;

    const defaultLocation = getDefaultLocationForProfile(profile, locations);
    if (!defaultLocation) return;

    setIsDriverRoleDialogOpen(false);
    joinRide(
      buildJoinRideInput({
        travel,
        userId: user.id,
        role,
        defaultLocation,
      })
    );
  };

  const handleLeave = () => {
    if (!user) return;

    const newOwnerId = getOwnerTransferCandidate(travel, user.id, isOwner);

    leaveRide(
      {
        roomId: travel.id,
        userId: user.id,
        newOwnerId,
        onlyOne: travel.stops.length === 1,
      },
      {
        onSuccess: () => {
          navigate({ to: '/home' });
        },
      }
    );
  };

  const isLoading = isJoining || isLeaving;

  const handleRate = () => {
    if (!driverUserId || selectedRate === 0) return;
    rateDriver(
      { driverId: driverUserId, rate: selectedRate },
      { onSuccess: () => setIsRateDialogOpen(false) }
    );
  };

  return (
    <>
      <main className="flex-1 flex flex-col px-4 pt-4 gap-6">
        <div style={{ viewTransitionName: `ride-card-${travel.id}` }}>
          <RideCard {...travel} hideActions />
        </div>

        <DriverRoleDialog
          open={isDriverRoleDialogOpen}
          onOpenChange={setIsDriverRoleDialogOpen}
          onConfirm={joinWithRole}
          isPending={isJoining}
        />
        <DefaultLocationDialog
          open={isLocationDialogOpen}
          onOpenChange={setIsLocationDialogOpen}
          prompt={locationPrompt}
          isPending={isSavingLocation}
          onConfirm={(coords) => {
            if (!user) return;
            createLocation({
              userId: user.id,
              location: {
                name: 'Casa',
                coords,
              },
              setDefault: true,
            });
          }}
        />
        {seatRecommendation && (
          <Alert>
            <CircleAlert className="h-4 w-4" />
            <AlertTitle>Recomendación de asiento</AlertTitle>
            <AlertDescription>{seatRecommendation}</AlertDescription>
          </Alert>
        )}
        {(hasDriverPaymentMethods || canRateDriver) && (
          <div className="flex justify-between">
            {canRateDriver ? (
              <Dialog
                open={isRateDialogOpen}
                onOpenChange={setIsRateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="ghost">Calificar conductor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Calificar conductor</DialogTitle>
                    <DialogDescription>
                      ¿Cómo fue tu experiencia con el conductor?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1 transition-transform hover:scale-110"
                          onMouseEnter={() => setHoveredRate(star)}
                          onMouseLeave={() => setHoveredRate(0)}
                          onClick={() => setSelectedRate(star)}
                        >
                          <Star
                            className="h-8 w-8"
                            fill={
                              star <= (hoveredRate || selectedRate)
                                ? 'currentColor'
                                : 'none'
                            }
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      disabled={selectedRate === 0 || isRating}
                      onClick={handleRate}
                    >
                      {isRating ? <Spinner /> : 'Enviar calificación'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div />
            )}
            {hasDriverPaymentMethods && (
              <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost">Ver QR del conductor</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>QR del conductor</DialogTitle>
                    <DialogDescription>
                      Elige Yape/Plin o Blockchain para realizar el pago del
                      viaje.
                    </DialogDescription>
                  </DialogHeader>
                  <DriverPaymentMethods
                    driverId={driverUserId}
                    fallbackQrUrl={driverQrUrl}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {isMember && user && hasMultipleParticipants && (
          <div className="flex-1 flex flex-col min-h-0 rounded-xl border">
            <TravelChat
              roomId={travel.id}
              username={user.fullName}
              userId={user.id}
            />
          </div>
        )}
      </main>
      <div className="w-full py-12  px-4 z-40 ">
        <div className=" max-w-3xl mx-auto">
          {isMember && user ? (
            <div className="flex gap-2 ">
              {travel.currentStop === 0 && (
                <QuitDialog
                  willTransferOwnership={isOwner && travel.stops.length > 1}
                  handleLeave={handleLeave}
                  isLoading={isLoading}
                />
              )}
              {travel.stops.length > 1 && (
                <NextStepDialog travel={travel} userId={user.id} />
              )}
            </div>
          ) : (
            <Button
              className="w-full h-12  py-2"
              onClick={
                user
                  ? handleJoin
                  : async () => await AuthService.login(`/travel/${travel.id}`)
              }
              disabled={isLoading || (user ? travel.currentStop !== 0 : false)}
            >
              <Typography variant="large">
                {isLoading ? (
                  <Spinner />
                ) : user ? (
                  travel.currentStop === 0 ? (
                    'Unirse al viaje'
                  ) : (
                    'El viaje ya comenzó'
                  )
                ) : (
                  'Ingresa con correo PUCP para unirte'
                )}
              </Typography>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
