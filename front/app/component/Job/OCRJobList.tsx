// components/Job/OCRJobList
import React from 'react';
import { type Job } from '#/hooks/useJobParser';
import { useOcrJobStore, useOcrHasHydrated } from '#/stores';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { FileText } from 'lucide-react';

interface OCRJobListProps {
  onSelectJob: (job: Job) => void;
}

const OCRJobList: React.FC<OCRJobListProps> = ({ onSelectJob }) => {
  const { jobs, isProcessing } = useOcrJobStore();
  const hasHydrated = useOcrHasHydrated();

  // Show loading state while processing or before hydration
  if (isProcessing || !hasHydrated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {isProcessing ? 'Processing document...' : 'Loading extracted jobs...'}
        </Typography>
      </Box>
    );
  }

  // Don't render anything if no jobs are extracted
  if (jobs.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <FileText size={20} style={{ marginRight: '8px' }} />
        Extracted Job Listings
      </Typography>

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
              onClick={() => onSelectJob(job)}
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
    </>
  );
};

export default OCRJobList;
