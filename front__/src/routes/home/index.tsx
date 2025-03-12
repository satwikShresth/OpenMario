import { Box, Paper, Typography, Container } from '@mui/material';
import { Banknote } from 'lucide-react';
import { createFileRoute, retainSearchParams } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { FilterSchema, type Filter } from '#/utils/validators';
import { getSubmissionsOptions } from '#client/react-query.gen';
import { FilterProvider, useFilterStore } from '#/stores/useFilterStore';
import { useFilterNavigation } from '#/hooks/useFilterNavigation';
import FilterDrawer from '#/components/Home/FilterDrawer';
import DataTable from '#/components/Home';

export const Route = createFileRoute('/home/')({
  component: TablePageComponent,
  validateSearch: zodValidator({
    schema: FilterSchema,
    input: "output",
    output: "input",
  }),
  search: { middlewares: [retainSearchParams(true)] },
  //loader: async ({ context: { queryClient }, search }) => {
  //  await queryClient.ensureQueryData({
  //    ...getSubmissionsOptions({ query: search }),
  //    refetchOnWindowFocus: false
  //  })
  //},
  errorComponent: ({ error }) => (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">Error loading data: {error.message}</Typography>
      </Box>
    </Container>
  )
});

// Create a component to handle synchronization
const FilterSync = () => {
  useFilterNavigation();
  return null;
};

export default function TablePageComponent() {
  const search = Route.useSearch() as Filter;

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%' }}>
        <FilterProvider initialValue={search}>
          {/* This component will sync filter state with URL */}
          <FilterSync />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, ml: 2, width: '100%' }}>
            <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
              <Banknote size={24} style={{ marginRight: '8px' }} />
              Anonymous Salary Information
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FilterDrawer />
            </Box>
          </Box>

          {/* Table component */}
          <DataTable query={search} />

          <Paper elevation={1} sx={{ p: 2, mt: 4, borderRadius: 1, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Note: All compensation data is self-reported by students.
            </Typography>
          </Paper>
        </FilterProvider>
      </Box>
    </Container>
  );
}
