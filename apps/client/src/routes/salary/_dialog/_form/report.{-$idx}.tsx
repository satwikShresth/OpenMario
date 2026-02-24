import { createFileRoute } from '@tanstack/react-router';
import { toaster } from '@/components/ui/toaster';
import { Salary } from '@/components/Salary';
import type { SubmissionAggregate } from '@openmario/contracts';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/helpers';
import { upsertSubmission, updateSubmission } from '@/db/mutations';
import { useSubmissionById } from '@/db/stores/submissions';

export const Route = createFileRoute('/salary/_dialog/_form/report/{-$idx}')({
   component: () => {
      const { idx } = Route.useParams();
      const navigate = Route.useNavigate();

      const raw = useSubmissionById(idx);
      // Only treat as editable if still a draft
      const draftRow = raw?.is_draft ? raw : null;

      const draft = draftRow ? {
         id: draftRow.id,
         owner_id: undefined,
         company: draftRow.company,
         position: draftRow.position,
         location: draftRow.location,
         work_hours: draftRow.work_hours,
         compensation: draftRow.compensation,
         other_compensation: draftRow.other_compensation || '',
         details: draftRow.details || '',
         year: draftRow.year,
         coop_year: draftRow.coop_year,
         coop_cycle: draftRow.coop_cycle,
         program_level: draftRow.program_level,
      } : null;

      const submitMutation = useMutation(orpc.submission.create.mutationOptions());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         const submissionPromise = submitMutation
            .mutateAsync(value)
            .then(async ({ id, message }) => {
               console.log(message);
               if (draftRow) {
                  await updateSubmission(draftRow.id, {
                     server_id: id, owner_id: null, status: 'synced', is_draft: false,
                     company: value.company, position: value.position, location: value.location,
                     year: value.year, coop_year: value.coop_year, coop_cycle: value.coop_cycle,
                     program_level: value.program_level, work_hours: value.work_hours,
                     compensation: value.compensation,
                     other_compensation: value.other_compensation ?? null,
                     details: value.details ?? null, synced_at: new Date().toISOString(),
                  });
               } else {
                  await upsertSubmission({
                     id, server_id: id, owner_id: null, status: 'synced', is_draft: false,
                     company: value.company, company_id: value.company ?? null,
                     position: value.position, position_id: value.position ?? null,
                     location: value.location, location_city: null, location_state: null, location_state_code: null,
                     year: value.year, coop_year: value.coop_year, coop_cycle: value.coop_cycle,
                     program_level: value.program_level, work_hours: value.work_hours,
                     compensation: value.compensation, other_compensation: value.other_compensation ?? null,
                     details: value.details ?? null, synced_at: new Date().toISOString(),
                  });
               }
               navigate({ to: '/salary' });
            })
            .catch(console.error);

         toaster.promise(submissionPromise, {
            success: { title: 'Successfully reported your salary!', description: 'Everything looks great' },
            error: { title: 'Failed to report your salary', description: 'Something wrong with the submission' },
            loading: { title: 'Reporting...', description: 'Please wait' },
         });
      };

      return <Salary.Form defaultValues={draft as any} onSubmit={onSubmit} />;
   },
});
