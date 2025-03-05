// route/home
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import OCRJobList from '#/component/Job/OCRJobList';
import SubmissionList from '#/component/Job/SubmissionList';
import FileUpload from '#/component/FileUpload';
import { type Job, useJobParser, useTesseract } from '#/hooks';
import { useJobSubmissionStore, useOcrJobStore } from '#/stores';
import { enqueueSnackbar } from 'notistack';
import type { CommonData } from '#/types';
import { Typography, Button, Box, Alert, Paper } from '@mui/material';
import { Plus, Briefcase } from 'lucide-react';


export const meta = () => {
  return [
    { title: 'OpenMario | Submissions' },
    { name: 'description', content: '' },
  ];
};

export default () => {
  const navigate = useNavigate();
  const { recognizeText } = useTesseract();
  const { removeSubmission } = useJobSubmissionStore();
  const { jobs, setJobs, clearJobs, setProcessing } = useOcrJobStore();
  const { processText } = useJobParser();

  const processFile = useCallback(async (file: File, common: CommonData) => {
    if (!file) return;

    clearJobs();
    setProcessing(true);

    try {
      const text = await recognizeText(file);
      const processedJobs = processText(text, common);
      setJobs(processedJobs);
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setProcessing(false);
    }
  }, [recognizeText, processText, clearJobs, setJobs, setProcessing]);

  const handleAddNew = () => {
    navigate('/form');
  };

  const handleEdit = (index: number) => {
    navigate(`/form?submission=${index}`);
  };

  const handleSelectJob = (job: Job) => {
    const jobIndex = jobs
      .findIndex(
        j => j.position === job.position
          && j.employer === job.employer
          && j.location === job.location
      );

    if (jobIndex !== -1) {
      navigate(`/form?ocr=${jobIndex}`);
    } else {
      navigate('/form');
    }
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to delete this job submission?')) {
      removeSubmission(index);
    }
  };

  const showOcrAlert = jobs.length > 0;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <Briefcase size={24} style={{ marginRight: '8px' }} />
          Job Submissions
        </Typography>

        <div>
          <FileUpload onFileSelect={processFile} />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleAddNew}
          >
            Add New Salary
          </Button>
        </div>
      </Box>

      {showOcrAlert && (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Click on a job to edit details before adding to your submissions
            </Alert>

            <Box sx={{ ml: 2, mb: 2 }}>
              <OCRJobList onSelectJob={handleSelectJob} />
            </Box>
          </Paper>
        </Box>
      )}


      <SubmissionList
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
};
