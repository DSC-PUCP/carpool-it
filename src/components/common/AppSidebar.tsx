import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
  Car,
  ChevronsUpDown,
  CirclePlus,
  LogOut,
  Settings,
} from 'lucide-react';
import { navItems } from '@/components/layout/nav-items';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useActiveRide } from '@/hooks/useActiveRide';
import { TOUR_STEP_IDS } from '@/lib/tour-constants';
import { getFallbackAvatar } from '@/lib/utils';

type AppSidebarProps = {
  avatar: string;
  email: string;
  fullName: string;
  onLogout(): void;
};
export default function AppSidebar({
  avatar,
  email,
  fullName,
  onLogout,
}: AppSidebarProps) {
  const { data: activeRide } = useActiveRide();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  return (
    <Sidebar variant="floating">
      <SidebarHeader className="flex h-16 items-center px-6 border-b">
        <span className="text-xl font-bold tracking-tight ">Carpool.it</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 mt-4 mb-2">
            Secciones
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  id={TOUR_STEP_IDS.SIDEBAR_NEW_TRAVEL}
                  onClick={() => {
                    activeRide
                      ? navigate({
                          to: '/travel/$id',
                          params: {
                            id: activeRide,
                          },
                        })
                      : navigate({
                          to: '/travel/new',
                        });
                  }}
                  className="h-11 bg-primary text-sidebar-primary-foreground hover:bg-primary/90 hover:text-sidebar-primary-foreground active:bg-primary/90 active:text-sidebar-primary-foreground  min-w-8 duration-200 ease-linear"
                >
                  {activeRide ? <Car /> : <CirclePlus />}
                  {activeRide ? 'Ir a mi viaje' : 'Nuevo viaje'}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    id={
                      item.href === '/home'
                        ? TOUR_STEP_IDS.SIDEBAR_HOME
                        : item.href === '/profile'
                          ? TOUR_STEP_IDS.SIDEBAR_PROFILE
                          : undefined
                    }
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.label}
                    className="h-11"
                  >
                    <Link to={item.href}>
                      <item.icon className="size-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  id={TOUR_STEP_IDS.SIDEBAR_ACCOUNT}
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar} alt={'cb'} />
                    <AvatarFallback>
                      {getFallbackAvatar(fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={avatar} alt={fullName} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{fullName}</span>
                      <span className="truncate text-xs">{email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <Settings />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onLogout()}>
                    <LogOut />
                    Salir
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
