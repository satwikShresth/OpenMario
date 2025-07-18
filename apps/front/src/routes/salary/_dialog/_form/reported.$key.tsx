import { createFileRoute } from '@tanstack/react-router';
import { Form } from './-form.tsx';

export const Route = createFileRoute('/salary/_dialog/_form/reported/$key')({
   component: () => {
      const { key } = Route.useParams();

      return <Form isSubmitted idx={key!} />;
   },
});
