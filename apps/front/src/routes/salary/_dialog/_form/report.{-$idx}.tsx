import { createFileRoute } from '@tanstack/react-router';
import { Form } from './-form.tsx';

export const Route = createFileRoute('/salary/_dialog/_form/report/{-$idx}')({
   component: () => {
      const { idx } = Route.useParams();
      return <Form idx={parseInt(idx!)} />;
   },
});
