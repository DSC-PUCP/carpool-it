import { cn } from '@/lib/utils';
import styles from './GlowBackground.module.css';

export default function GlowBackground(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className={cn(
            'absolute top-[-20%] left-[-20%] w-[60%] h-[60%]',
            styles['primary-glow']
          )}
        />
        <div
          className={cn(
            'absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%]',
            styles['primary-glow']
          )}
        />
      </div>
      <div className="relative z-0 flex flex-col h-dvh w-full" {...props} />
    </>
  );
}
