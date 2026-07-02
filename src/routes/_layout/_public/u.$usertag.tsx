import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import {
  TopStack,
  TopStackAction,
  TopStackTitle,
} from '@/components/layout/top-stack/TopStack';
import { Button } from '@/components/ui/button';
import { QueryKeys } from '@/const/query-keys';
import { env } from '@/env';
import PublicProfile from '@/modules/profile/pages/public-profile/PublicProfile';
import { ProfileService } from '@/modules/profile/services';

export const Route = createFileRoute('/_layout/_public/u/$usertag')({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const result = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.RECURRENTS, params.usertag],
      queryFn: () => ProfileService.getPublicProfileByTag(params.usertag),
    });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};

    const title = `${loaderData.tag} - Viajes Recurrentes`;
    const description = loaderData.isDriver
      ? `Conductor con ${loaderData.ridesCount} viajes. Viajes recurrentes disponibles.`
      : `Pasajero con ${loaderData.ridesCount} viajes.`;

    return {
      title,
      meta: [
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        {
          property: 'og:image',
          content: loaderData.avatar || `${env.VITE_SERVER_URL}/favicon.ico`,
        },
        {
          property: 'og:url',
          content: `${env.VITE_SERVER_URL}/u/${loaderData.tag}`,
        },
        { property: 'twitter:card', content: 'summary' },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold">Usuario no encontrado</h2>
        <p className="text-muted-foreground mt-2">
          El perfil que buscas no existe.
        </p>
        <Button asChild className="mt-4">
          <Link to="/home">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  ),
});

function RouteComponent() {
  const profile = Route.useLoaderData();

  return (
    <>
      <TopStack>
        <TopStackAction>
          <Link to="/home" search={{}}>
            <ArrowLeft />
          </Link>
        </TopStackAction>
        <TopStackTitle>Perfil</TopStackTitle>
        <TopStackAction />
      </TopStack>
      <PublicProfile profile={profile} />
    </>
  );
}
