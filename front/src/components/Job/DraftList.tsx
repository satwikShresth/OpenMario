// components/Job/DraftList.tsx
import React from 'react';
import { useJobSubmissionStore } from '#/stores/useJobSubmissionStore';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { FileText, Clock } from 'lucide-react';

interface DraftListProps {
  onSelectDraft: (index: number) => void;
}

const DraftList: React.FC<DraftListProps> = ({ onSelectDraft }) => {
  const { draftSubmissions } = useJobSubmissionStore();

  if (draftSubmissions.length === 0) {
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
        <Clock size={48} color="#9e9e9e" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          No Draft Submissions
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Upload a file with job listings or save a submission as draft to see it here.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <FileText size={20} style={{ marginRight: '8px' }} />
        Draft Submissions
      </Typography>

      <Grid container spacing={2}>
        {draftSubmissions.map((draft, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => onSelectDraft(idx)}
            >
              <Chip
                label="DRAFT"
                size="small"
                color="warning"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}
              />

              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom noWrap>
                  {draft.position || 'Untitled Position'}
                </Typography>

                {draft.company && (
                  <Typography variant="body2" gutterBottom noWrap>
                    <strong>Company:</strong> {draft.company}
                  </Typography>
                )}

                {draft.location && (
                  <Typography variant="body2" gutterBottom noWrap>
                    <strong>Location:</strong> {draft.location}
                  </Typography>
                )}

                {draft.compensation && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    <strong>Rate:</strong> ${parseFloat(draft.compensation.toString()).toFixed(2)}/hr
                  </Typography>
                )}

                <Box sx={{ mt: 1, textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Click to edit
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

export default DraftList;
