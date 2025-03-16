// submissions/$formId.edit.tsx
import React, { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import JobForm from '#/components/Job/Form';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import { type Position } from '#/utils/validators';
import type { Submission, SubmissionAggregate } from '#/types';
import { Box, Typography } from '@mui/material';
import { Edit } from 'lucide-react';
import { patchSubmissionsMutation, postSubmissionsMutation } from '#client/react-query.gen';

export const Route = createFileRoute('/submission/edit/$formId')({
  loader: ({ params }) => {
    const formId = parseInt(params.formId);
    return { formId };
  },
  component: EditSubmissionComponent,
});

function EditSubmissionComponent() {
  const navigate = useNavigate();
  const { formId } = Route.useLoaderData();
  const { enqueueSnackbar } = useSnackbar();

  const { submissions, updateSubmission, removeSubmission } = useJobSubmissionStore();

  const submissionIndex = formId;
  const submissionData = submissions[submissionIndex];
  const updateMutation = useMutation(patchSubmissionsMutation());
  const formDefaultValues = useMemo(() => submissionData, [submissionData]);
  const id = submissionData?.id;


  const handleCancel = () => {
    navigate({ to: '/submission' });
  };

  const handleSubmit = (data: Position) => {
    updateMutation.mutate({
      body: { ...data, id }
    }, {
      onSuccess: () => {
        updateSubmission(submissionIndex, data as Submission);
        enqueueSnackbar('Submission updated successfully', { variant: 'success' });
        navigate({ to: '/submission' });
      },
      onError: (error: any) => {
        console.error('Error updating job:', error);

        if (error.response?.data) {
          const errorData = error.response.data;

          if (errorData.message === "Validation failed" && Array.isArray(errorData.details)) {
            errorData.details.forEach((detail: any) => {
              const fieldName = detail.field.charAt(0).toUpperCase() + detail.field.slice(1);
              enqueueSnackbar(`${fieldName}: ${detail.message}`, { variant: 'error' });
            });
          } else {
            enqueueSnackbar(errorData.message || 'Failed to update job', { variant: 'error' });
          }
        } else {
          enqueueSnackbar('An unexpected error occurred. Please try again.', { variant: 'error' });
        }
      }
    });

  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      removeSubmission(submissionIndex);
      enqueueSnackbar('Submission deleted successfully', { variant: 'success' });
      navigate({ to: '/submission' });
    }
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Edit size={24} style={{ marginRight: '8px' }} />
          Edit Submission
        </Typography>
      </Box>

      <JobForm
        onDraft={(data) => updateSubmission(submissionIndex, data)}
        editIndex={submissionIndex}
        formDefaultValues={formDefaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error?.message}
        onDelete={handleDelete}
      />
    </>
  );
}
