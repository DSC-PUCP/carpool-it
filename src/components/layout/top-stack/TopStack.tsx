import { cn } from '@/lib/utils';

export function TopStack({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        'flex items-center px-4 py-4 justify-between sticky top-0 z-50',
        className
      )}
      {...props}
    />
  );
}

export function TopStackTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={cn(
        'text-lg font-bold leading-tight tracking-tight flex-1 text-center',
        className
      )}
    />
  );
}

export function TopStackAction({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={cn('flex items-center justify-center', className)}
      {...props}
    />
  );
}
