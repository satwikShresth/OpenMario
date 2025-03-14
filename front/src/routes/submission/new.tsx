import { useSnackbar } from 'notistack';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import JobForm from '#/components/Job/Form';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import { type Position } from '#/utils/validators';
import type { Submission, SubmissionAggregate } from '#/types';
import { postSubmissionsMutation } from '#client/react-query.gen';
import { useCallback } from 'react';

export const Route = createFileRoute('/submission/new')({
  component: FormPageComponent,
})


export default function FormPageComponent() {
  const navigate = useNavigate();
  const { addSubmission, addDraftSubmission } = useJobSubmissionStore();
  const { enqueueSnackbar } = useSnackbar();

  const submitMutation = useMutation(postSubmissionsMutation());

  const formDefaultValues = {
    company: '',
    position: '',
    location: '',
    program_level: 'Undergraduate',
    work_hours: 40,
    coop_cycle: 'Fall/Winter',
    coop_year: '1st',
    year: new Date().getFullYear(),
    compensation: "10.00",
    other_compensation: '',
    details: `Employer ID: 'N/A', Position ID: 'N/A', Job Length: 'N/A', Coop Round: 'N/A'`
  };

  const handleDraft = (data) => {
    addDraftSubmission(data)
    navigate({ to: '/submission' });
  };

  const handleCancel = () => {
    navigate({ to: '/submission' });
  };

  const handleSubmit = (data: Position) => {
    submitMutation.mutate({
      body: data as SubmissionAggregate,
    }, {
      onSuccess: ({ id, message }) => {
        addSubmission({ ...data as Submission, id });
        enqueueSnackbar(message, { variant: 'success' });
        navigate({ to: '/submission' });
      },
      onError: (error) => {
        console.error('Error submitting job:', error);

        if (error.response?.data) {
          const errorData = error.response.data;

          if (errorData.message === "Validation failed" && Array.isArray(errorData.details)) {
            errorData.details.forEach((detail) => {
              const fieldName = detail.field.charAt(0).toUpperCase() + detail.field.slice(1);
              enqueueSnackbar(`${fieldName}: ${detail.message}`, { variant: 'error' });
            });
          } else {
            enqueueSnackbar(errorData.message || 'Failed to submit job', { variant: 'error' });
          }
        } else {
          enqueueSnackbar('An unexpected error occurred. Please try again.', { variant: 'error' });
        }
      }
    });
  }

  return (
    <>
      <JobForm
        onDraft={handleDraft}
        formDefaultValues={formDefaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={submitMutation.isPending}
        submitError={submitMutation.error?.message}
      />
    </>
  );
};


