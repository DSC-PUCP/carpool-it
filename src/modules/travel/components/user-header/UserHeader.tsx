import { ModeToggle } from '@/components/common/ModeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFallbackAvatar } from '@/lib/utils';
import SegmentedControl from './SegmentedControl';

type Props = {
  avatar: string;
  fullName: string;
};
export default function UserHeader({ avatar, fullName }: Props) {
  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-12 pb-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar} />
            <AvatarFallback>{getFallbackAvatar(fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Buen día, Bienvenid@ de nuevo!
            </p>
            <h2 className="text-lg font-bold leading-tight">
              {fullName.split(' ')[0]}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <SegmentedControl />
    </header>
  );
}
