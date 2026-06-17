import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Car, Plus } from 'lucide-react';
import { navItems } from '@/components/layout/nav-items';
import { useActiveRide } from '@/hooks/useActiveRide';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import {
  Navbar,
  NavbarAction,
  NavbarItem,
  NavbarItemIcon,
  NavbarItemLabel,
} from '../layout/nav-bar/Navbar';

export default function AppNavbar() {
  const location = useLocation();
  const { data: activeRide } = useActiveRide();
  const navigate = useNavigate();
  const halfCount = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, halfCount);
  const rightItems = navItems.slice(halfCount);
  const relativeLocationIndex = navItems.findIndex(
    (item) => item.href === location.pathname
  );
  return (
    <Navbar>
      {/* Left side items */}
      <div className="flex flex-1 justify-around items-center h-full">
        {leftItems.map((item, i) => (
          <NavbarItem key={item.href} active={location.pathname === item.href}>
            <Link
              id={item.href === '/home' ? TOUR_STEP_IDS.NAVBAR_HOME : undefined}
              to={item.href}
              className="w-full h-full flex flex-col items-center justify-center"
              viewTransition={{
                types:
                  relativeLocationIndex > i ? ['slide-right'] : ['slide-left'],
              }}
            >
              <NavbarItemIcon>
                <item.icon size={20} />
              </NavbarItemIcon>
              <NavbarItemLabel>{item.label}</NavbarItemLabel>
            </Link>
          </NavbarItem>
        ))}
      </div>

      {/* Central Action Button Spacer/Wrapper */}
      <NavbarAction
        id={TOUR_STEP_IDS.NAVBAR_NEW_TRAVEL}
        onClick={() =>
          activeRide
            ? navigate({
                to: '/travel/$id',
                params: {
                  id: activeRide,
                },
              })
            : navigate({
                to: '/travel/new',
              })
        }
      >
        {activeRide ? <Car size={28} /> : <Plus size={28} />}
      </NavbarAction>

      {/* Right side items */}
      <div className="flex flex-1 justify-around items-center h-full">
        {rightItems.map((item, i) => (
          <NavbarItem key={item.href} active={location.pathname === item.href}>
            <Link
              id={
                item.href === '/profile'
                  ? TOUR_STEP_IDS.NAVBAR_PROFILE
                  : undefined
              }
              to={item.href}
              className="w-full h-full flex flex-col items-center justify-center"
              viewTransition={{
                types:
                  relativeLocationIndex > i + leftItems.length
                    ? ['slide-right']
                    : ['slide-left'],
              }}
            >
              <NavbarItemIcon>
                <item.icon size={20} />
              </NavbarItemIcon>
              <NavbarItemLabel>{item.label}</NavbarItemLabel>
            </Link>
          </NavbarItem>
        ))}
        {/* Maintain symmetry if we have an odd number of total items */}
        {rightItems.length < leftItems.length && (
          <div className="flex-1" aria-hidden="true" />
        )}
      </div>
    </Navbar>
  );
}
