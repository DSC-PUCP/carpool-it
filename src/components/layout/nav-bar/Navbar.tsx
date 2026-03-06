import { Slot } from '@radix-ui/react-slot';
import type * as React from 'react';
import glassStyles from '@/assets/styles/glass.module.css';
import { cn } from '@/lib/utils';

export function Navbar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      data-slot="navbar"
      className={cn(
        'relative z-50 md:hidden w-full h-16 flex items-center px-4 pb-safe',
        className
      )}
      {...props}
    >
      {/* Background with Notch cutout */}
      <div
        className={cn(
          'absolute inset-0 -z-10 border-t border-white/10',
          glassStyles['glass-nav']
        )}
        style={{
          maskImage:
            'radial-gradient(circle 40px at 50% 0, transparent 39px, black 40px)',
          WebkitMaskImage:
            'radial-gradient(circle 40px at 50% 0, transparent 39px, black 40px)',
        }}
      />

      <div
        data-slot="navbar-inner"
        className="flex justify-between items-center w-full relative h-full"
      >
        {children}
      </div>
    </nav>
  );
}

export function NavbarAction({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <div
      data-slot="navbar-action-wrapper"
      className="absolute left-1/2 -top-7 -translate-x-1/2 flex items-center justify-center z-10"
    >
      <button
        type="button"
        data-slot="navbar-action"
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 active:scale-95 ring-4 ring-background',
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

export function NavbarItem({
  children,
  className,
  active = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="navbar-item"
      className={cn(
        'flex-1 flex justify-center items-center h-full',
        className
      )}
      {...props}
      aria-current={active ? 'page' : undefined}
    >
      <Slot
        className={cn(
          'flex flex-col items-center justify-center gap-1 transition-colors relative h-full w-full max-w-[64px]',
          active ? 'text-primary' : 'text-muted-foreground hover:text-primary',
          className
        )}
      >
        {children}
      </Slot>
    </div>
  );
}

export function NavbarItemIcon({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="navbar-item-icon"
      className={cn('flex items-center justify-center', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function NavbarItemLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="navbar-item-label"
      className={cn('text-[10px] font-medium leading-none', className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function NavbarItemBadge({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="navbar-item-badge"
      className={cn(
        'absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground font-medium ring-2 ring-background',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
