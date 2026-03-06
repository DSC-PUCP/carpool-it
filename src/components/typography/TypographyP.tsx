import { cn } from '@/lib/utils';

export default function TypographyP({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <p {...props} className={cn('leading-7 not-first:mt-6', className)} />;
}
