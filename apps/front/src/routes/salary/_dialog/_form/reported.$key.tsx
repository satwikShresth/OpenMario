import { createFileRoute } from '@tanstack/react-router';
import { Salary, useSalaryStore } from '@/components/Salary';
import { patchV1SubmissionsMutation, type SubmissionAggregate } from '@/client';
import { useMutation } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster';

export const Route = createFileRoute('/salary/_dialog/_form/reported/$key')({
   component: () => {
      const { key } = Route.useParams();
      const navigate = Route.useNavigate();
      const defaultValues = useSalaryStore(({ submissions }) => submissions.get(key!));
      const actions = useSalaryStore(({ actions }) => actions);
      const patchMutation = useMutation(patchV1SubmissionsMutation());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         const patchPromise = patchMutation
            .mutateAsync({ body: { ...value, id: key! } })
            .then(() => {
               console.log('updated submission');
               actions.updateSubmission(key!, value as SubmissionAggregate);
               navigate({ to: '/salary/submissions' });
            })
            .catch(console.error);

         toaster.promise(patchPromise, {
            success: {
               title: 'Successfully updated your salary!',
               description: 'Everything looks great',
            },
            error: {
               title: 'Failed to update your salary',
               description: 'Something wrong with the submission',
            },
            loading: { title: 'Updating...', description: 'Please wait' },
         });
      };

      return (
         <Salary.Form
            defaultValues={defaultValues}
            onSubmit={onSubmit}
         />
      );
   },
});
