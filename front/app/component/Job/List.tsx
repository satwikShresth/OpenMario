import React, { useState } from 'react';
import JobCard from './Card';
import JobForm from './Form';
import FileUpload from '#/component/FileUpload';
import { useJobSubmissionStore, useHasHydrated } from '#/stores/useJobSubmissionStore';
import { type Job } from '#/hooks/useJobParser';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Container,
  Grid
} from '@mui/material';
import { Plus, FileText, Briefcase } from 'lucide-react';
import type { CommonData } from '#/types';

interface JobListProps {
  jobs?: Job[];
  onFileSelect: (file: File, common: CommonData) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs = [], onFileSelect }) => {
  const { submissions, removeSubmission } = useJobSubmissionStore();
  const hasHydrated = useHasHydrated();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setIsFormOpen(true);
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to delete this job submission?')) {
      removeSubmission(index);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditIndex(undefined);
    setSelectedJob(undefined);
  };

  // Function to handle selecting from OCR jobs list
  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  // Only show content after hydration is complete
  if (!hasHydrated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading submissions...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Briefcase size={24} style={{ marginRight: '8px' }} />
            Job Submissions
          </Typography>

          {!isFormOpen && (
            <div>
              <FileUpload onFileSelect={onFileSelect} />
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={18} />}
                onClick={() => setIsFormOpen(true)}
              >
                Add New Job
              </Button>
            </div>
          )}
        </Box>

        {isFormOpen ? (
          <JobForm
            editIndex={editIndex}
            defaultValues={editIndex !== undefined ? submissions[editIndex] : undefined}
            jobData={selectedJob}
            onCancel={handleCancel}
          />
        ) : (
          <Box>
            {/* Display OCR-detected jobs if available */}
            {jobs && jobs.length > 0 && (
              <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <FileText size={20} style={{ marginRight: '8px' }} />
                  Extracted Job Listings
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Alert severity="info">
                    Click on a job to edit details before adding to your submissions
                  </Alert>
                </Box>

                <Grid container spacing={2}>
                  {jobs.map((job, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={() => handleSelectJob(job)}
                      >
                        <CardContent>
                          <Typography variant="subtitle1" color="primary" gutterBottom noWrap>
                            {job.position} {job.position_id && `(${job.position_id})`}
                          </Typography>

                          {job.employer && (
                            <Typography variant="body2" gutterBottom noWrap>
                              <strong>Employer:</strong> {job.employer}
                            </Typography>
                          )}

                          {job.location && (
                            <Typography variant="body2" gutterBottom noWrap>
                              <strong>Location:</strong> {job.location}
                            </Typography>
                          )}

                          {job.hourly_wage && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              <strong>Rate:</strong> {job.hourly_wage}
                            </Typography>
                          )}

                          <Box sx={{ mt: 1, textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                              Click to add
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Display saved submissions */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Your Submissions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {submissions.length === 0 ? (
                <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No job submissions yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click "Add New Job" to get started
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {submissions.map((submission, index) => (
                    <JobCard
                      key={index}
                      submission={submission}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default JobList;
