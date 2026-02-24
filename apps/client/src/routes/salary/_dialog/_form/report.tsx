import { createFileRoute } from '@tanstack/react-router';
import { toaster } from '@/components/ui/toaster';
import { Salary } from '@/components/Salary';
import type { SubmissionAggregate } from '@openmario/contracts';
import { useMutation } from '@tanstack/react-query';
import { orpc } from '@/helpers';
import { upsertSubmission } from '@/db/mutations';

export const Route = createFileRoute('/salary/_dialog/_form/report')({
	component: () => {
		const navigate = Route.useNavigate();
		const submitMutation = useMutation(orpc.submission.create.mutationOptions());

		const onSubmit = ({ value }: { value: SubmissionAggregate }) => {
			const submissionPromise = submitMutation
				.mutateAsync(value)
				.then(async ({ id, message }) => {
					console.log(message);
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
					navigate({ to: '/salary' });
				})
				.catch(console.error);

			toaster.promise(submissionPromise, {
				success: { title: 'Successfully reported your salary!', description: 'Everything looks great' },
				error: { title: 'Failed to report your salary', description: 'Something wrong with the submission' },
				loading: { title: 'Reporting...', description: 'Please wait' },
			});
		};

		return <Salary.Form onSubmit={onSubmit} />;
	},
});
