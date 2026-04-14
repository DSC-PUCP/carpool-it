import { Leaf, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';

export default function StatsCards() {
  const { data: profile } = useProfile();
  return (
    <div className="px-4 mb-8" id={TOUR_STEP_IDS.PROFILE_STATS}>
      <div className="grid grid-cols-3 gap-3">
        {/* Rating Stat */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-3 backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-1 text-yellow-500">
              <span className="text-xl font-bold text-foreground">
                {profile?.rating ? profile.rating.toFixed(1) : 'N/A'}
              </span>
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Rating
            </span>
          </CardContent>
        </Card>

        {/* Rides Stat */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-3 backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xl font-bold text-foreground">
                {profile?.ridesCount}
              </span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Viajes
            </span>
          </CardContent>
        </Card>

        {/* CO2 Saved Stat */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-3 backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-1 mb-1 text-green-500">
              <span className="text-xl font-bold text-foreground">
                {profile?.co2Saved}
              </span>
              <span className="text-xs font-bold mt-1">kg</span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
              <Leaf className="w-3 h-3" /> CO2 Ahorrado
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
