import { createFileRoute } from '@tanstack/react-router';
import { toaster } from '@/components/ui/toaster';
import { Salary } from '@/components/Salary';
import type { SubmissionAggregate } from '@openmario/server/contracts';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/helpers';
import { useLiveQuery, eq, and } from '@tanstack/react-db';
import { submissionsCollection } from '@/helpers';

export const Route = createFileRoute('/salary/_dialog/_form/report/{-$idx}')({
   component: () => {
      const { idx } = Route.useParams();
      const navigate = Route.useNavigate();

      const { data: draft } = useLiveQuery(
         (q) => q
            .from({ sub: submissionsCollection })
            .select(({ sub }) => ({
               id: sub.id,
               owner_id: undefined,
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
               and(
                  eq(sub.isDraft, true),
                  eq(sub.id, idx!)
               )
            ).findOne()
      );

      const submitMutation = useMutation(orpc.submission.create.mutationOptions());

      const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
         const submissionPromise = submitMutation
            .mutateAsync(value)
            .then(({ id, message }) => {
               console.log(message);

               if (draft) {
                  // Move draft to submission
                  submissionsCollection.update(draft.id, (draftUpdate) => {
                     draftUpdate.serverId = id;
                     draftUpdate.ownerId = null;
                     draftUpdate.status = 'synced';
                     draftUpdate.isDraft = false;
                     draftUpdate.company = value.company;
                     draftUpdate.position = value.position;
                     draftUpdate.location = value.location;
                     draftUpdate.year = value.year;
                     draftUpdate.coopYear = value.coop_year;
                     draftUpdate.coopCycle = value.coop_cycle;
                     draftUpdate.programLevel = value.program_level;
                     draftUpdate.workHours = value.work_hours;
                     draftUpdate.compensation = value.compensation;
                     draftUpdate.otherCompensation = value.other_compensation;
                     draftUpdate.details = value.details;
                     draftUpdate.syncedAt = new Date();
                     draftUpdate.updatedAt = new Date();
                  });
               } else {
                  // Add new submission
                  submissionsCollection.insert({
                     id,
                     serverId: id,
                     ownerId: null,
                     status: 'synced',
                     isDraft: false,
                     company: value.company,
                     companyId: value.company || '',
                     position: value.position,
                     positionId: value.position || '',
                     location: value.location,
                     locationCity: null,
                     locationState: null,
                     locationStateCode: null,
                     year: value.year,
                     coopYear: value.coop_year,
                     coopCycle: value.coop_cycle,
                     programLevel: value.program_level,
                     workHours: value.work_hours,
                     compensation: value.compensation,
                     otherCompensation: value.other_compensation,
                     details: value.details,
                     syncedAt: new Date(),
                     createdAt: new Date(),
                     updatedAt: new Date()
                  });
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
            defaultValues={draft as any}
            onSubmit={onSubmit}
         />
      );
   },
});
