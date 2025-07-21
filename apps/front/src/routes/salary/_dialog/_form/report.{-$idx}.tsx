import { createFileRoute } from '@tanstack/react-router';
import { toaster } from '@/components/ui/toaster';
import { Salary, useSalaryStore } from '@/components/Salary';
import { postV1SubmissionsMutation, type SubmissionAggregate } from '@/client';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/salary/_dialog/_form/report/{-$idx}')({
   component: () => {
      const { idx } = Route.useParams();
      const navigate = Route.useNavigate();
      const defaultValues = useSalaryStore(({ draftSubmissions }) =>
         draftSubmissions[parseInt(idx!)]
      );
      const actions = useSalaryStore(({ actions }) => actions);
      const submitMutation = useMutation(postV1SubmissionsMutation());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         const submissionPromise = submitMutation
            .mutateAsync({ body: value })
            .then(({ id, owner_id, message }) => {
               console.log(message);
               if (defaultValues) {
                  actions.moveDraftToSubmission(parseInt(idx!)!, id!, {
                     ...value!,
                     owner_id: owner_id!,
                  });
               } else {
                  actions.addSubmission(id, { ...value, owner_id: owner_id! });
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
