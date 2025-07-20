import { createFileRoute } from '@tanstack/react-router';
import { Salary } from '@/components/Salary';

export const Route = createFileRoute('/salary/_dialog/_form/reported/$key')({
   component: () => {
      // const { key } = Route.useParams();
      return (
         <Salary.Form
            onSubmit={async ({ value }) => await console.log(value)}
         />
      );
   },
});
