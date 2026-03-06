import { CarFrontIcon, LucideStar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileHeader() {
  return (
    <div className="flex items-center justify-between pb-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkUHww1gLznDZt7XiiyKPvgCyMzQuiey8WRUZCMH-VCcVXCeg684fKqcOgUWgnEgTTEPFbYUNJhcFSqJR0aq3FtKlgnneo5JoemIEyKhroT6ViwY-XUSNm75ZNsz3PZIxkdxAz0gpcoxMZ8d89-O79xZo5c5JwQ9PnX8Alc04C7JOQJhps5KtF17hxK1cMTunarhQhFc2f0LAMVndaC2lB7N2sSL2h3jXC0nncYE3CmBHdL7PZFJwlFPVwR7UK4VW57wNanZ8-jBg" />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold leading-tight">Alex Johnson</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <LucideStar className="text-yellow-500" />

            <span className="text-muted-foreground text-sm font-medium">
              4.8
            </span>
            <span className="text-muted-foreground  text-xs">•</span>
            <span className="text-muted-foreground text-sm">120 rides</span>
          </div>
        </div>
      </div>
      {/* Car Info */}
      <div className="flex flex-col items-end">
        <CarFrontIcon className="text-muted-foreground" />
        <p className="text-muted-foreground text-xs font-medium text-right mt-1">
          Honda Civic
          <br />
          Silver
        </p>
      </div>
    </div>
  );
}
