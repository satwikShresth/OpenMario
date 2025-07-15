import { redirect } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

ex port const Route = createFileRoute('/')({
   loader: () => {
      throw redirect({ to: '/home' });
   },
 });
