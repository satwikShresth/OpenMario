// components/Job/SubmissionList.tsx
import React from 'react';
import JobCard from './Card';
import { Box, Typography, Paper } from '@mui/material';
import { AlertCircle } from 'lucide-react';
import type { Submission } from '#/types';

interface SubmissionListProps {
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  submissions?: Submission[];
  isDraftList?: boolean;
  onSelect?: (index: number) => void;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  onEdit,
  onDelete,
  submissions,
  isDraftList = false,
  onSelect
}) => {

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

  return (
    <Box sx={{ mb: 2 }}>
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

