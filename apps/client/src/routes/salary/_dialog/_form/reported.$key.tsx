import { createFileRoute } from '@tanstack/react-router';
import { Salary } from '@/components/Salary';
import { useMutation } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster';
import type { SubmissionAggregate } from '@openmario/contracts';
import { orpc } from '@/helpers';
import { updateSubmission } from '@/db/mutations';
import { useSubmissionByKey } from '@/db/stores/submissions';

export const Route = createFileRoute('/salary/_dialog/_form/reported/$key')({
   component: () => {
      const { key } = Route.useParams();
      const navigate = Route.useNavigate();

      const submissionRow = useSubmissionByKey(key);

      const submission = submissionRow ? {
         id: submissionRow.id,
         owner_id: submissionRow.owner_id || undefined,
         company: submissionRow.company,
         position: submissionRow.position,
         location: submissionRow.location,
         work_hours: submissionRow.work_hours,
         compensation: submissionRow.compensation,
         other_compensation: submissionRow.other_compensation || '',
         details: submissionRow.details || '',
         year: submissionRow.year,
         coop_year: submissionRow.coop_year,
         coop_cycle: submissionRow.coop_cycle,
         program_level: submissionRow.program_level,
      } : null;

      const patchMutation = useMutation(orpc.submission.update.mutationOptions());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         const { id: _id, owner_id: _owner, ...updateData } = value as any;
         const patchPromise = patchMutation
            .mutateAsync({ id: key!, ...updateData })
            .then(async () => {
               if (submissionRow) {
                  await updateSubmission(submissionRow.id, {
                     company: value.company, position: value.position,
                     location: value.location, year: value.year,
                     coop_year: value.coop_year, coop_cycle: value.coop_cycle,
                     program_level: value.program_level, work_hours: value.work_hours,
                     compensation: value.compensation,
                     other_compensation: value.other_compensation ?? null,
                     details: value.details ?? null,
                  });
               }
               navigate({ to: '/salary/submissions' });
            })
            .catch(console.error);

         toaster.promise(patchPromise, {
            success: { title: 'Successfully updated your salary!', description: 'Everything looks great' },
            error: { title: 'Failed to update your salary', description: 'Something wrong with the submission' },
            loading: { title: 'Updating...', description: 'Please wait' },
         });
      };

      return <Salary.Form defaultValues={submission as any} onSubmit={onSubmit} />;
   },
});
