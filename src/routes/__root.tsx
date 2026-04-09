import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/components/context/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryDevtoolsPanel from '@/integrations/tanstack-query/devtools';
import { AuthService } from '@/modules/auth/services';
import PushNotificationsBootstrap from '@/modules/notifications/components/PushNotificationsBootstrap';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Carpool It',
      },
    ],
    links: [
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  beforeLoad: async () => {
    const user = await AuthService.getSession();
    return {
      user,
    };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PushNotificationsBootstrap />
          <Toaster position="top-right" />
        </ThemeProvider>
        <TanStackDevtools
          plugins={[
            ReactQueryDevtoolsPanel,
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
