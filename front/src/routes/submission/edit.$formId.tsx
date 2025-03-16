// submissions/$formId.edit.tsx
import React, { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import JobForm from '#/components/Job/Form';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import { type Position } from '#/utils/validators';
import type { Submission, SubmissionAggregate } from '#/types';
import { Box, Typography } from '@mui/material';
import { Edit } from 'lucide-react';
import { patchSubmissionsMutation } from '#client/react-query.gen';

export const Route = createFileRoute('/submission/edit/$formId')({
  loader: ({ params }) => {
    const formId = params.formId;
    return { formId };
  },
  component: EditSubmissionComponent,
});

function EditSubmissionComponent() {
  const navigate = useNavigate();
  const { formId } = Route.useLoaderData();
  const { enqueueSnackbar } = useSnackbar();
  const { submissions, updateSubmission, removeSubmission } = useJobSubmissionStore();
  const submissionData = submissions && submissions.get(formId);
  const updateMutation = useMutation(patchSubmissionsMutation());
  const [externalErrors, setExternalErrors] = useState([]);

  const formDefaultValues = useMemo(() => submissionData, [submissionData]);

  const handleCancel = () => {
    navigate({ to: '/submission' });
  };

  const handleSubmit = (data: Position) => {
    updateMutation.mutate({
      body: { ...data, id: formId }
    }, {
      onSuccess: () => {
        updateSubmission(formId, data as Submission);
        enqueueSnackbar('Submission updated successfully', { variant: 'success' });
        navigate({ to: '/submission' });
      },
      onError: (error: any) => {
        console.error('Error updating job:', error);
        if (error.response?.data) {
          const errorData = error.response.data;
          if (errorData.message === "Validation failed" && Array.isArray(errorData.details)) {
            // Set external errors to be passed to the form
            setExternalErrors(errorData.details);

            // Also show as snackbar notifications
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
      removeSubmission(formId);
      enqueueSnackbar('Submission deleted successfully', { variant: 'success' });
      navigate({ to: '/submission' });
    }
  };

  if (!submissionData) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6">
          Submission not found
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Edit size={24} style={{ marginRight: '8px' }} />
          Edit Submission
        </Typography>
      </Box>
      <JobForm
        onDraft={(data) => updateSubmission(formId, data)}
        formDefaultValues={formDefaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={updateMutation.isPending}
        submitError={updateMutation.error?.message}
        onDelete={handleDelete}
        externalErrors={externalErrors}
      />
    </>
  );
}

