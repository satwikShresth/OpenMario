// submissions/$formId.tsx
import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import JobForm from '#/components/Job/Form';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import type { Submission } from '#/types';
import { Box, Typography } from '@mui/material';
import { Edit } from 'lucide-react';
import type { Position } from 'postcss';
import { useMutation } from '@tanstack/react-query';
import { postSubmissionsMutation } from '#client/react-query.gen';

export const Route = createFileRoute('/submission/$formId')({
   loader: ({ params }) => {
      const formId = parseInt(params.formId);
      return { formId };
   },
   component: DraftFormComponent,
});

function DraftFormComponent() {
   const navigate = useNavigate();
   const { formId } = Route.useLoaderData();
   const { enqueueSnackbar } = useSnackbar();
   const {
      draftSubmissions,
      updateDraftSubmission,
      moveDraftToSubmission,
      removeDraftSubmission,
   } = useJobSubmissionStore();
   const draftIndex = formId.toString();
   const draftData = draftSubmissions[draftIndex];
   const [externalErrors, setExternalErrors] = useState([]);

   if (!draftData) {
      navigate({ to: '/submission' });
      return null;
   }

   const formDefaultValues = useMemo(() => draftData, [draftData]);

   const handleCancel = () => {
      navigate({ to: '/submission' });
   };

   const postMutation = useMutation(postSubmissionsMutation());

   const handleSubmit = (data: Position) => {
      postMutation.mutate({
         body: data,
      }, {
         onSuccess: ({ id, owner_id, message }) => {
            enqueueSnackbar('Submission updated successfully', {
               variant: 'success',
            });
            moveDraftToSubmission(Number.parseInt(draftIndex), id!, {
               ...data,
               owner_id,
            });
            console.log(`Job Complete: ${message}`);
            navigate({ to: '/submission' });
         },
         onError: (error: any) => {
            console.error('Error updating job:', error);
            if (error.response?.data) {
               const errorData = error.response.data;
               if (
                  errorData.message === 'Validation failed' &&
                  Array.isArray(errorData.details)
               ) {
                  // Set external errors to be passed to the form
                  setExternalErrors(errorData.details);

                  // Also show as snackbar notifications
                  errorData.details.forEach((detail: any) => {
                     const fieldName = detail.field.charAt(0).toUpperCase() +
                        detail.field.slice(1);
                     enqueueSnackbar(`${fieldName}: ${detail.message}`, {
                        variant: 'error',
                     });
                  });
               } else {
                  enqueueSnackbar(errorData.message || 'Failed to update job', {
                     variant: 'error',
                  });
               }
            } else {
               enqueueSnackbar('An unexpected error occurred. Please try again.', {
                  variant: 'error',
               });
            }
         },
      });
   };

   const handleCompleteDraft = (data: any) => {
      updateDraftSubmission(draftIndex, data as Submission);
      moveDraftToSubmission(draftIndex);
      enqueueSnackbar('Draft moved to submissions successfully', {
         variant: 'success',
      });
      navigate({ to: '/submission' });
   };

   const handleDeleteDraft = () => {
      if (window.confirm('Are you sure you want to delete this draft?')) {
         removeDraftSubmission(draftIndex);
         enqueueSnackbar('Draft deleted successfully', { variant: 'success' });
         navigate({ to: '/submission' });
      }
   };

   return (
      <>
         <Box sx={{ mb: 3 }}>
            <Typography
               variant='h5'
               component='h1'
               sx={{ display: 'flex', alignItems: 'center' }}
            >
               <Edit size={24} style={{ marginRight: '8px' }} />
               Edit Draft Submission
            </Typography>
         </Box>
         <JobForm
            onDraft={(data) => updateDraftSubmission(draftIndex, data)}
            formDefaultValues={formDefaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={postMutation.isPending}
            submitError={postMutation.error?.message}
            isDraft={true}
            onCompleteDraft={handleCompleteDraft}
            onDelete={handleDeleteDraft}
            externalErrors={externalErrors}
         />
      </>
   );
}
