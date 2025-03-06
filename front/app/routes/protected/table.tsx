import { Box, Paper, Typography, Container } from '@mui/material';
import SubmissionsTable from '#/component/Table';
import { SubmissionsProvider } from '#/stores';

export const meta = () => {
  return [
    { title: 'Co-op Submissions | Dashboard' },
    { name: 'description', content: 'Browse and filter student co-op experiences and salaries' },
  ];
};

export default function TablePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Co-op Submissions Dashboard
        </Typography>
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Typography variant="body1">
            Browse and filter student co-op experiences. Find information about companies,
            positions, and compensation to help with your career decisions.
          </Typography>
        </Paper>
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
          <SubmissionsProvider initialValue={{ initialLimit: 10, initialSkip: 0 }}>
            <SubmissionsTable />
          </SubmissionsProvider>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, mt: 4, borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Note: All compensation data is self-reported by students.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
