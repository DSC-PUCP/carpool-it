import { useRouteContext } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/use-profile';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import EditTagDialog from './EditTagDialog';

export default function ProfileHeader() {
  const {
    user: { avatar, email, fullName },
  } = useRouteContext({ from: '/_layout/_auth/profile/' });

  const { data: profileData } = useProfile();
  return (
    <div
      className="flex flex-col items-center px-6 pt-2 pb-6"
      id={TOUR_STEP_IDS.PROFILE_HEADER}
    >
      {/* Avatar with Glow */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-tr from-primary to-purple-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200" />
        <div className="relative">
          <Avatar className="w-28 h-28 border-4 border-white dark:border-[#1e1e2d] shadow-xl">
            <AvatarImage src={avatar} alt={`Portrait of ${fullName}`} />
            <AvatarFallback>
              {fullName
                .split(' ')
                .map((name) => name[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-[#1e1e2d] flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <h2 className=" text-2xl font-bold leading-tight">{fullName}</h2>
        <p className="text-muted-foreground  text-sm font-medium">{email}</p>
        <p className="text-lg font-semibold ">
          {profileData?.tag ? `@${profileData.tag}` : 'Sem tag definida'}
        </p>
      </div>
      <EditTagDialog />
    </div>
  );
}
