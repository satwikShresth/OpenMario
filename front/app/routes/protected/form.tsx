// components/Job/Form.tsx
import React, { useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import JobForm from '#/component/Job/Form';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import { useOcrJobStore } from '#/stores/useOcrJobStore';
import { type Position } from '#/utils/validators';
import type { Submission, SubmissionAggregate } from '#client/types.gen';
import { postSubmissionsMutation } from '#client/react-query.gen';

export const meta = () => {
  return [
    { title: 'OpenMario | Form' },
    { name: 'description', content: '' },
  ];
};

const FormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { submissions, addSubmission, updateSubmission } = useJobSubmissionStore();
  const { jobs } = useOcrJobStore();
  const { enqueueSnackbar } = useSnackbar();

  const submissionIndexParam = searchParams.get('submission');
  const ocrIndexParam = searchParams.get('ocr');

  const submissionIndex = submissionIndexParam ? parseInt(submissionIndexParam) : undefined;
  const ocrIndex = ocrIndexParam ? parseInt(ocrIndexParam) : undefined;

  const submissionData = submissionIndex !== undefined ? submissions[submissionIndex] : undefined;
  const ocrData = ocrIndex !== undefined ? jobs[ocrIndex] : undefined;

  // Setup the mutation
  const submitMutation = useMutation(postSubmissionsMutation());

  const formDefaultValues = useMemo(() => {
    const data = ocrData || submissionData;
    return {
      company: data?.company || '',
      position: data?.position || '',
      location: data?.location || '',
      program_level: data?.program_level || 'Undergraduate',
      work_hours: parseInt(data?.work_hours || "40"),
      coop_cycle: data?.coop_cycle || 'Fall/Winter',
      coop_year: data?.coop_year || '1st',
      year: data?.year || new Date().getFullYear(),
      compensation: parseFloat(data?.compensation || "10.00"),
      other_compensation: data?.other_compensation || '',
      details: `Employer ID: ${data?.employer_id || 'N/A'}, Position ID: ${data?.position_id || 'N/A'}, Job Length: ${data?.job_length || 'N/A'}, Coop Round: ${data?.coop_round || 'N/A'}`
    };
  }, [ocrData, submissionData]);

  const handleCancel = () => {
    navigate('/submissions');
  };

  const handleSubmit = (data: Position) => {
    if (submissionIndex !== undefined) {
      updateSubmission(submissionIndex, data as Submission);
      enqueueSnackbar('Submission updated successfully', { variant: 'success' });
      navigate('/submissions');
    } else {
      submitMutation.mutate({
        body: data as SubmissionAggregate,
      }, {
        onSuccess: () => {
          addSubmission(data as Submission);
          enqueueSnackbar('Submission added successfully', { variant: 'success' });
          navigate('/submissions');
        },
        onError: (error) => {
          console.error('Error submitting job:', error);

          // Handle validation errors
          if (error.response?.data) {
            const errorData = error.response.data;

            if (errorData.message === "Validation failed" && Array.isArray(errorData.details)) {
              // Create validation error messages
              errorData.details.forEach((detail) => {
                const fieldName = detail.field.charAt(0).toUpperCase() + detail.field.slice(1);
                enqueueSnackbar(`${fieldName}: ${detail.message}`, { variant: 'error' });
              });
            } else {
              // General error message
              enqueueSnackbar(errorData.message || 'Failed to submit job', { variant: 'error' });
            }
          } else {
            // Fallback error message
            enqueueSnackbar('An unexpected error occurred. Please try again.', { variant: 'error' });
          }
        }
      });
    }
  };

  return (
    <>
      <JobForm
        editIndex={submissionIndex}
        formDefaultValues={formDefaultValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={submitMutation.isPending}
        submitError={submitMutation.error?.message}
      />
    </>
  );
};

export default FormPage;
