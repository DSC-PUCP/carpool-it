import glassStyles from '@/assets/styles/glass.module.css';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ChipsGrid from './chips-grid/ChipsGrid';
import ProfileHeader from './profile-header/ProfileHeader';
import RouteInfo from './route-info/RouteInfo';

export default function InfoCard() {
  return (
    <Card>
      <CardContent className="space-y-2">
        <ProfileHeader />
        <Separator />
        <RouteInfo />
        <ChipsGrid />
      </CardContent>
    </Card>
  );
}
