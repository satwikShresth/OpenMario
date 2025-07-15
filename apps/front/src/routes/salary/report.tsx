import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/salary/report')({
   component: () => {
      return <div>Hello "/salary/report"!</div>;
   },
});
