// components/Job/SubmissionList.tsx
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
import { AlertCircle } from 'lucide-react';
import type { Submission } from '#client/types.gen';

interface SubmissionListProps {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  submissions?: Submission[]; // Optional prop to explicitly pass submissions
  isDraftList?: boolean;      // Flag to indicate if this is drafts list
  onSelect?: (index: number) => void; // Optional handler for row selection
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  onEdit,
  onDelete,
  submissions: submissionsProp,
  isDraftList = false,
  onSelect
}) => {
  const store = useJobSubmissionStore();
  const submissions = submissionsProp || (isDraftList ? store.draftSubmissions : store.submissions);
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading {isDraftList ? 'drafts' : 'submissions'}...
        </Typography>
      </Box>
    );
  }

  // No submissions/drafts to display
  if (submissions.length === 0) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: '#f5f5f5'
        }}
      >
        <AlertCircle size={48} color="#9e9e9e" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          {isDraftList ? 'No Draft Submissions' : 'No Submissions'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {isDraftList
            ? 'Save your progress by clicking "Save as Draft" when creating a new submission.'
            : 'Click "Add New Salary" to get started.'}
        </Typography>
      </Paper>
    );
  }

  // Display submissions/drafts as cards
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isDraftList ? 'Your Draft Submissions' : 'Your Submissions'}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ mt: 2 }}>
        {submissions.map((submission, index) => (
          <Box
            key={index}
            onClick={isDraftList && onSelect ? () => onSelect(index) : undefined}
            sx={isDraftList && onSelect ? {
              cursor: 'pointer',
              '&:hover': {
                '& > div': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
              }
            } : undefined}
          >
            <JobCard
              submission={submission}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              isDraft={isDraftList}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SubmissionList;
