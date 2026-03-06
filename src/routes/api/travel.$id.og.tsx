import { createFileRoute } from '@tanstack/react-router';
import { ImageResponse } from 'workers-og';
import RideCardOg from '@/modules/travel/components/ride-card/RideCardOg';
import { TravelService } from '@/modules/travel/services';

export const Route = createFileRoute('/api/travel/$id/og')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { id } = params;

        try {
          const room = await TravelService.getRoomDetails(id);

          if (!room) {
            return new Response('Room not found', { status: 404 });
          }

          const image = new ImageResponse(<RideCardOg {...room} />, {
            width: 1200,
            height: 630,
          });
          return new Response(await image.arrayBuffer(), {
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        } catch (error) {
          console.error('Error generating OG image:', error);
          return new Response('Error generating image', { status: 500 });
        }
      },
    },
  },
});
