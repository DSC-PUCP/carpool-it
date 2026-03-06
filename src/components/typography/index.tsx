import type { PropsWithChildren } from 'react';
import TypographyH1 from './TypographyH1';
import TypographyH2 from './TypographyH2';
import TypographyH3 from './TypographyH3';
import TypographyH4 from './TypographyH4';
import TypographyLarge from './TypographyLarge';
import TypographyMuted from './TypographyMuted';
import TypographyP from './TypographyP';

type TypographyProps = {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'muted' | 'large';
};

export default function Typography({
  variant = 'p',
  children,
}: PropsWithChildren<TypographyProps>) {
  let Component = TypographyP;
  if (variant === 'h1') Component = TypographyH1;
  if (variant === 'h2') Component = TypographyH2;
  if (variant === 'h3') Component = TypographyH3;
  if (variant === 'h4') Component = TypographyH4;
  if (variant === 'muted') Component = TypographyMuted;
  if (variant === 'large') Component = TypographyLarge;

  return <Component>{children}</Component>;
}
