import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if ('user' in context && context.user)
      throw redirect({
        to: '/travel/new',
      });
    else
      throw redirect({
        to: '/sign-in',
      });
  },
});
