import { Link, useRouteContext } from '@tanstack/react-router';
import { ArrowLeft, Edit, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import Typography from '@/components/typography';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import type { UserLocation } from '@/core/models';
import { useProfile } from '@/hooks/use-profile';
import LocationDialog from './components/LocationDialog';
import { useCreateLocation } from './hooks/useCreateLocation';
import { useDefaultLocation } from './hooks/useDefaultLocation';
import { useDeleteLocation } from './hooks/useDeleteLocation';
import { useListLocation } from './hooks/useListLocation';
import { useUpdateLocation } from './hooks/useUpdateLocation';

export default function Locations() {
  const { data: locations } = useListLocation();
  const { data: profile } = useProfile();
  const { user } = useRouteContext({
    from: '/_layout/_auth/profile/locations',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<null | UserLocation>(
    null
  );
  const { mutate: createMutate } = useCreateLocation();
  const { mutate: deleteMutate, isPending } = useDeleteLocation();
  const { mutate: updateMutate } = useUpdateLocation();
  const { mutate: defaultMutate } = useDefaultLocation();
  return (
    <div className="flex-1 [view-transition-name:main-content]">
      <TopStack>
        <TopStackAction>
          <Link to=".." viewTransition={{ types: ['slide-right'] }}>
            <ArrowLeft />
          </Link>
        </TopStackAction>
        <TopStackTitle>Mis Zonas</TopStackTitle>
        <TopStackAction>
          <LocationDialog
            key={selectedLocation ? selectedLocation.id : 'new'}
            open={isAddDialogOpen}
            onOpenChange={(val) => {
              setIsAddDialogOpen(val);
              if (!val) setSelectedLocation(null);
            }}
            onSubmit={(data) => {
              selectedLocation
                ? updateMutate({
                    ...data,
                    id: selectedLocation.id,
                  })
                : createMutate({
                    userId: user.id,
                    location: data,
                    setDefault: locations.length === 0,
                  });
            }}
            defaultValues={selectedLocation ?? undefined}
          />
        </TopStackAction>
      </TopStack>

      <main className=" overflow-y-auto p-4 space-y-4">
        <div className="grid gap-3">
          {locations.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia>
                  <MapPin className="h-12 w-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No tienes ubicaciones guardadas aún</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar zona
                </Button>
              </EmptyContent>
              <Typography variant="muted">
                Puedes crear hasta 5 ubicaciones
              </Typography>
            </Empty>
          ) : (
            locations.map((location) => (
              <Card key={location.id} className="overflow-hidden">
                <div className="flex items-center p-4 gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{location.name}</h3>
                    <p className="text-sm text-muted-foreground truncate"></p>
                  </div>
                  <Button
                    disabled={profile?.locationId === location.id}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 mr-2"
                    onClick={() => {
                      defaultMutate({
                        userId: user.id,
                        locationId: location.id,
                      });
                    }}
                  >
                    <Star
                      className={
                        profile?.locationId === location.id
                          ? 'text-yellow-400 fill-yellow-400'
                          : ''
                      }
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:text-primary hover:bg-primary/10 shrink-0 mr-2"
                    onClick={() => {
                      setSelectedLocation(location);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Edit />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => deleteMutate(location.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
