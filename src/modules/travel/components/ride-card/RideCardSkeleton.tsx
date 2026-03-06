import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function RideCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden relative">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 60%, transparent 100%)',
          backgroundSize: '100% 300%',
          animation: 'skeleton-sweep 2s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes skeleton-sweep { 0% { background-position: 0 -100% } 100% { background-position: 0 200% } }`}</style>
      <CardContent className="p-4 space-y-4">
        {/* Header: Route & Time */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex gap-3 relative h-full">
              {/* Visual Timeline */}
              <div className="flex flex-col items-center pt-1.5 h-full min-h-20">
                <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
                <Skeleton className="w-0.5 grow my-1" />
                <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              </div>

              {/* Route Text */}
              <div className="flex flex-col justify-between gap-4 py-0.5 w-full">
                {/* Origin Group */}
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* Destination Group */}
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Price & Availability */}
          <div className="flex flex-col items-end gap-1 pl-2 min-w-25 shrink-0">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-24 rounded-md mt-1" />
          </div>
        </div>

        <Separator />

        {/* Footer: Driver & Action */}
        <div className="flex justify-between pt-1 items-end">
          <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1 overflow-hidden">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 w-full">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex -space-x-2 overflow-hidden pl-1 md:pl-0">
              <Skeleton className="h-7 w-7 rounded-full ring-2 ring-background border border-background" />
              <Skeleton className="h-7 w-7 rounded-full ring-2 ring-background border border-background" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-end gap-2 shrink-0">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
