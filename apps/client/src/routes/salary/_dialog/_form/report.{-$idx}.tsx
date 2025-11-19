import { createFileRoute } from '@tanstack/react-router';
import { toaster } from '@/components/ui/toaster';
import { Salary, useSalaryStore } from '@/components/Salary';
import type { SubmissionAggregate } from '@openmario/server/contracts';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/helpers';

export const Route = createFileRoute('/salary/_dialog/_form/report/{-$idx}')({
   component: () => {
      const { idx } = Route.useParams();
      const navigate = Route.useNavigate();
      const { draftSubmissions, actions } = useSalaryStore();
      const defaultValues = draftSubmissions[parseInt(idx!)];
      const submitMutation = useMutation(orpc.submission.create.mutationOptions());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         const submissionPromise = submitMutation
            .mutateAsync(value)
            .then(({ id, message }) => {
               console.log(message);
               if (defaultValues) {
                  actions.moveDraftToSubmission(parseInt(idx!)!, id, {
                     ...value,
                  });
               } else {
                  actions.addSubmission(id, { ...value });
               }
               navigate({ to: '/salary' });
            })
            .catch(console.error);

         toaster.promise(submissionPromise, {
            success: {
               title: 'Successfully reported your salary!',
               description: 'Everything looks great',
            },
            error: {
               title: 'Failed to report your salary',
               description: 'Something wrong with the submission',
            },
            loading: { title: 'Reporting...', description: 'Please wait' },
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
