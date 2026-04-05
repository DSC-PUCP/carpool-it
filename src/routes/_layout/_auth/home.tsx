import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';
import { QueryKeys } from '@/const/query-keys';
import { getDirectionByHour, getNowInLima } from '@/lib/utils';
import { TravelService } from '@/modules/travel/services';
import Travel from '@/modules/travel/Travel';

const locationSchema = z.union([
  z.literal('default'),
  z.literal('none'),
  z.object({
    lat: z.coerce.number(),
    lon: z.coerce.number(),
  }),
]);

const homeSearchSchema = z
  .object({
    direction: z.enum(['to_campus', 'from_campus']).optional().catch(undefined),
    datetime: z.coerce
      .date()
      .refine((d) => !Number.isNaN(d.getTime()))
      .optional()
      .catch(undefined),
    onlyOffers: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined;
        return val === 'true' || val === true;
      })
      .catch(undefined),
    // 'default' => force loader default location
    // 'none'    => explicitly disable location filtering
    // {lat,lon} => explicit custom coordinates
    location: locationSchema.optional().catch(undefined),
    limit: z.coerce.number().optional().catch(undefined),
    offset: z.coerce.number().optional().catch(undefined),
  })
  .partial();

export const Route = createFileRoute('/_layout/_auth/home')({
  component: RouteComponent,
  validateSearch: (search) => homeSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({
    context: { queryClient, profileData, locationsData },
    deps,
  }) => {
    const hour = getNowInLima().getHours();
    const defaultDirection = getDirectionByHour(hour);
    const defaultLocation = profileData?.locationId
      ? locationsData.find((loc) => loc.id === profileData.locationId)?.coords
      : undefined;

    const resolvedLocation =
      deps.location === 'none'
        ? undefined
        : deps.location === 'default' || deps.location === undefined
          ? defaultLocation
          : deps.location;

    const filters = {
      direction: deps.direction ?? defaultDirection,
      datetime: deps.datetime,
      onlyOffers: profileData?.isDriver ? false : (deps.onlyOffers ?? true),
      limit: deps.limit ?? 5,
      offset: deps.offset ?? 0,
      location: resolvedLocation,
    };

    await queryClient.ensureInfiniteQueryData({
      queryKey: [QueryKeys.TRAVEL, filters],
      queryFn: () => TravelService.listRooms(filters),
      initialPageParam: 0,
    });

    return { filters };
  },
});

function RouteComponent() {
  return <Travel />;
}
