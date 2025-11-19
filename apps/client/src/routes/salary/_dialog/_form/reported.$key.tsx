import { createFileRoute } from '@tanstack/react-router';
import { Salary, useSalaryStore } from '@/components/Salary';
import { useMutation } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster';
import type { SubmissionAggregate } from '@openmario/server/contracts';
import { orpc } from '@/helpers';

export const Route = createFileRoute('/salary/_dialog/_form/reported/$key')({
   component: () => {
      const { key } = Route.useParams();
      const navigate = Route.useNavigate();
      const { submissions, actions } = useSalaryStore();
      const defaultValues = submissions.get(key!);
      const patchMutation = useMutation(orpc.submission.update.mutationOptions());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         // Ensure id from route param, not from form value
         const { id: _id, owner_id: _owner, ...updateData } = value as any;
         const patchPromise = patchMutation
            .mutateAsync({ id: key!, ...updateData })
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
