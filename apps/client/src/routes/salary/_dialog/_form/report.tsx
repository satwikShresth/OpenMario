import { createFileRoute } from '@tanstack/react-router';
import { toaster } from '@/components/ui/toaster';
import { Salary } from '@/components/Salary';
import type { SubmissionAggregate } from '@openmario/contracts';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/helpers';
import { submissionsCollection } from '@/helpers';

export const Route = createFileRoute('/salary/_dialog/_form/report')({
	component: () => {
		const navigate = Route.useNavigate();
		const submitMutation = useMutation(orpc.submission.create.mutationOptions());

		const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
			const submissionPromise = submitMutation
				.mutateAsync(value)
				.then(({ id, message }) => {
					console.log(message);
					// Add to local collection
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
				onSubmit={onSubmit}
			/>
		);
	},
});

