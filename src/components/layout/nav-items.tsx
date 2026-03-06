import { Home, User } from 'lucide-react';
import type { FileRoutesByTo } from '@/routeTree.gen';

export interface NavItem {
  label: string;
  href: keyof FileRoutesByTo;
  icon: React.ElementType;
}

export const navItems: NavItem[] = [
  {
    label: 'Inicio',
    href: '/home',
    icon: Home,
  },

  {
    label: 'Perfil',
    href: '/profile',
    icon: User,
  },
];

export default navItems;
