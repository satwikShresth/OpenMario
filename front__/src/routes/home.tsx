import { Box, Paper, Typography, Container } from '@mui/material';
import SubmissionsTable from '#/components/Table';
import FilterDarwer from '#/components/Table/FilterDrawer';
import { FilterProvider } from '#/stores';
import { createFileRoute, retainSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter'
import { FilterSchema, type Filter } from '#/utils/validators';
import ShareButton from '#/components/ShareButton';
import { Banknote } from 'lucide-react';

export const Route = createFileRoute('/home')({
  component: TablePageComponent,
  validateSearch: zodValidator({
    schema: FilterSchema,
    input: "output",
    output: "input",
  }),
  search: { middlewares: [retainSearchParams(true)] }
})

export default function TablePageComponent() {
  const search = Route.useSearch() as Filter;
  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%' }}>
        <FilterProvider initialValue={search}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, ml: 2, width: '100%' }}>
            <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
              <Banknote size={24} style={{ marginRight: '8px' }} />
              Anonymous Salary Information
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <ShareButton baseUrl={`${window.location.protocol}//${window.location.hostname}:${window.location.port}/home`} />
              <FilterDarwer />
            </Box>
          </Box>
          <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
            <SubmissionsTable />
          </Paper>
        </FilterProvider>

        <Paper elevation={1} sx={{ p: 2, mt: 4, borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Note: All compensation data is self-reported by students.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
