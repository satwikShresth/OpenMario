import { createFileRoute } from '@tanstack/react-router';
import { Salary, useSalaryStore } from '@/components/Salary';

export const Route = createFileRoute('/salary/_dialog/_form/report/{-$idx}')({
   component: () => {
      const { idx } = Route.useParams();
      const defaultValues = useSalaryStore(({ draftSubmissions }) =>
         draftSubmissions[parseInt(idx!)]
      );
      return (
         <Salary.Form
            defaultValues={defaultValues}
            onSubmit={async ({ value }) => await console.log(value)}
         />
      );
   },
});
