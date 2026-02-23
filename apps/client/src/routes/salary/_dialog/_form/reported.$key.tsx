import { createFileRoute } from '@tanstack/react-router';
import { Salary } from '@/components/Salary';
import { useMutation } from '@tanstack/react-query';
import { toaster } from '@/components/ui/toaster';
import type { SubmissionAggregate } from '@openmario/contracts';
import { orpc } from '@/helpers';
import { useLiveQuery, eq, or } from '@tanstack/react-db';
import { submissionsCollection } from '@/helpers';

export const Route = createFileRoute('/salary/_dialog/_form/reported/$key')({
   component: () => {
      const { key } = Route.useParams();
      const navigate = Route.useNavigate();

      const { data: submission } = useLiveQuery(
         (q) => q
            .from({ sub: submissionsCollection })
            .select(({ sub }) => ({
               id: sub.id,
               owner_id: sub.ownerId || undefined,
               company: sub.company,
               position: sub.position,
               location: sub.location,
               work_hours: sub.workHours,
               compensation: sub.compensation,
               other_compensation: sub.otherCompensation || '',
               details: sub.details || '',
               year: sub.year,
               coop_year: sub.coopYear,
               coop_cycle: sub.coopCycle,
               program_level: sub.programLevel
            }))
            .where(({ sub }) =>
               or(
                  eq(sub.serverId, key),
                  eq(sub.id, key)
               )
            ).findOne()
      );

      const patchMutation = useMutation(orpc.submission.update.mutationOptions());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         // Ensure id from route param, not from form value
         const { id: _id, owner_id: _owner, ...updateData } = value as any;
         const patchPromise = patchMutation
            .mutateAsync({ id: key!, ...updateData })
            .then(() => {
               console.log('updated submission');
               // Update in local collection
               if (submission) {
                  submissionsCollection.update(submission.id, (draft) => {
                     draft.company = value.company;
                     draft.position = value.position;
                     draft.location = value.location;
                     draft.year = value.year;
                     draft.coopYear = value.coop_year;
                     draft.coopCycle = value.coop_cycle;
                     draft.programLevel = value.program_level;
                     draft.workHours = value.work_hours;
                     draft.compensation = value.compensation;
                     draft.otherCompensation = value.other_compensation;
                     draft.details = value.details;
                     draft.updatedAt = new Date();
                  });
               }
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
            defaultValues={submission as any}
            onSubmit={onSubmit}
         />
      );
   },
});
