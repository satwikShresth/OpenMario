// submissions/index.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import SubmissionList from '#/components/Job/SubmissionList';
import FileUpload from '#/components/FileUpload';
import { useJobParser, useTesseract } from '#/hooks';
import { useJobSubmissionStore } from '#/stores';
import { enqueueSnackbar } from 'notistack';
import type { CommonData } from '#/types';
import { Alert, Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { Briefcase, Plus, Save } from 'lucide-react';
import { isLoggedIn } from '#/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getSubmissionsMeOptions } from '#client/react-query.gen';

export const Route = createFileRoute('/submission/')({
   component: () => {
      const { recognizeText } = useTesseract();
      const {
         submissions,
         removeSubmission,
         draftSubmissions,
         removeDraftSubmission,
         addDraftSubmission,
         clearDraftSubmissions,
         setProcessing,
         replaceAllSubmissions,
      } = useJobSubmissionStore();
      const { processText } = useJobParser();
      const [tabValue, setTabValue] = useState(0);
      const navigate = useNavigate({ from: '/submission' });

      const submissionIds = Array.from(submissions.keys());

      const { data: jobSubmissionsData, isSuccess } = useQuery({
         ...getSubmissionsMeOptions({
            query: { ids: submissionIds },
         }),
         staleTime: 6000,
         enabled: isLoggedIn(),
      });

      useEffect(() => {
         if (isSuccess && jobSubmissionsData.data) {
            replaceAllSubmissions(jobSubmissionsData.data);
         }
      }, [isSuccess, jobSubmissionsData, replaceAllSubmissions]);

      const processFile = useCallback(async (file: File, common: CommonData) => {
         if (!file) return;
         clearDraftSubmissions();
         setProcessing(true);
         try {
            const text = await recognizeText(file);
            const processedJobs = processText(text, common);

            processedJobs.forEach((job) => {
               addDraftSubmission({
                  company: job.company || '',
                  position: job.position || '',
                  location: job.location || '',
                  program_level: job.program_level || 'Undergraduate',
                  work_hours: job.work_hours ? parseInt(job.work_hours) : 40,
                  coop_cycle: job.coop_cycle || 'Fall/Winter',
                  coop_year: job.coop_year || '1st',
                  year: job.year || new Date().getFullYear(),
                  compensation: job.compensation
                     ? parseFloat(job.compensation.replace('$', ''))
                     : 10,
                  other_compensation: job.other_compensation || '',
                  details: `Employer ID: ${job.employer_id || 'N/A'}, Position ID: ${
                     job.position_id || 'N/A'
                  }, Job Length: ${job.job_length || 'N/A'}, Coop Round: ${
                     job.coop_round || 'N/A'
                  }`,
               });
            });

            if (processedJobs.length > 0) {
               enqueueSnackbar(`${processedJobs.length} jobs added as drafts`, {
                  variant: 'success',
               });
               setTabValue(1);
            } else {
               enqueueSnackbar('No jobs detected in the uploaded file', {
                  variant: 'warning',
               });
            }
         } catch (error: any) {
            console.error(`Error: ${error.message}`);
            enqueueSnackbar(error.message, { variant: 'error' });
         } finally {
            setProcessing(false);
         }
      }, [
         recognizeText,
         processText,
         clearDraftSubmissions,
         addDraftSubmission,
         setProcessing,
         enqueueSnackbar,
         setTabValue,
      ]);

      const handleAddNew = () => {
         navigate({ to: `/submission/new` });
      };

      const handleEditSubmission = (id: string) => {
         navigate({ to: `/submission/edit/${id}` });
      };

      const handleEditDraft = (index: number) => {
         navigate({ to: `/submission/${index}` });
      };

      const handleDeleteSubmission = (id: string) => {
         if (
            window.confirm('Are you sure you want to delete this job submission?')
         ) {
            removeSubmission(id);
         }
      };

      const handleDeleteDraft = (index: number) => {
         if (window.confirm('Are you sure you want to delete this draft?')) {
            removeDraftSubmission(index);
         }
      };

      const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
         setTabValue(newValue);
      };

      const showDraftsAlert = draftSubmissions.length > 0;

      return (
         <>
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
               }}
            >
               <Typography
                  variant='h5'
                  component='h1'
                  sx={{ display: 'flex', alignItems: 'center' }}
               >
                  <Briefcase size={24} style={{ marginRight: '8px' }} />
                  Job Submissions
               </Typography>
               <div>
                  <FileUpload onFileSelect={processFile} />
                  <Button
                     variant='contained'
                     color='primary'
                     startIcon={<Plus size={18} />}
                     onClick={handleAddNew}
                     sx={{ mx: 2, mb: 1, mt: 1 }}
                  >
                     Add New Salary
                  </Button>
               </div>
            </Box>

            {showDraftsAlert && tabValue !== 1 && (
               <Box sx={{ mb: 2 }}>
                  <Alert severity='info' sx={{ mb: 2 }}>
                     You have {draftSubmissions.length}{' '}
                     draft submissions. Switch to the "Drafts" tab to view and complete them.
                  </Alert>
               </Box>
            )}

            <Box sx={{ width: '100%', mb: 4 }}>
               <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                     value={tabValue}
                     onChange={handleTabChange}
                     aria-label='job submission tabs'
                     sx={{
                        maxHeight: 48,
                     }}
                  >
                     <Tab
                        label={`Submissions (${submissions.size})`}
                        icon={<Briefcase size={16} />}
                        iconPosition='start'
                        sx={{
                           fontSize: 14,
                           minHeight: 48,
                           padding: '0 16px',
                        }}
                     />
                     <Tab
                        label={`Drafts (${draftSubmissions.length})`}
                        icon={<Save size={16} />}
                        iconPosition='start'
                        sx={{
                           fontSize: 14,
                           minHeight: 48,
                           padding: '0 16px',
                        }}
                     />
                  </Tabs>
               </Box>
               <Box sx={{ mt: 2 }}>
                  {tabValue === 0 && (
                     <SubmissionList
                        onEdit={handleEditSubmission}
                        onDelete={handleDeleteSubmission}
                        submissions={submissions}
                        isDraftList={false}
                     />
                  )}
                  {tabValue === 1 && (
                     <SubmissionList
                        onEdit={handleEditDraft}
                        onDelete={handleDeleteDraft}
                        submissions={draftSubmissions}
                        isDraftList={true}
                        onSelect={handleEditDraft}
                     />
                  )}
               </Box>
            </Box>
         </>
      );
   },
});
