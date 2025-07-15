import { redirect } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
   loader: () => {
      throw redirect({ to: '/home' });
   },
});
