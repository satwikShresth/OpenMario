// components/Job/SubmissionList
import React from 'react';
import JobCard from './Card';
import { useJobSubmissionStore, useHasHydrated } from '#/stores/useJobSubmissionStore';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

interface SubmissionListProps {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const SubmissionList: React.FC<SubmissionListProps> = ({ onEdit, onDelete }) => {
  const { submissions } = useJobSubmissionStore();
  const hasHydrated = useHasHydrated();

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
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SubmissionList;
