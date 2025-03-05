import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Container, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import FilterForm from '#/component/FilterForm';
import SubmissionsTable from '#/component/SubmissionsTable';
import { getSubmissionsOptions } from '#client/react-query.gen';

interface ActiveFilters {
  company: string | null;
  position: string | null;
  location: string | null;
}

interface QueryFilter {
  company?: string[];
  position?: string[];
  location?: string[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  skip: number;
  limit: number;
}

export const meta = () => {
  return [
    { title: 'Co-op Submissions | Dashboard' },
    { name: 'description', content: 'Browse and filter student co-op experiences and salaries' },
  ];
};

export default function TablePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initPageIndex = parseInt(searchParams.get('page') || '0', 10);
  const initPageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const initCompany = searchParams.get('company') || null;
  const initPosition = searchParams.get('position') || null;
  const initLocation = searchParams.get('location') || null;
  const initSortField = searchParams.get('sortField') || '';
  const initSortDir = searchParams.get('sortDir') || '';

  // State for pagination, sorting, and filters
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initPageIndex,
    pageSize: initPageSize,
  });

  const [sorting, setSorting] = useState<SortingState>(
    initSortField ? [{ id: initSortField, desc: initSortDir === 'desc' }] : []
  );

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    company: initCompany,
    position: initPosition,
    location: initLocation
  });

  useEffect(() => {
    const newParams = new URLSearchParams();

    newParams.set('page', pagination.pageIndex.toString());
    newParams.set('pageSize', pagination.pageSize.toString());

    if (sorting.length > 0) {
      newParams.set('sortField', sorting[0].id);
      newParams.set('sortDir', sorting[0].desc ? 'desc' : 'asc');
    }

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  }, [pagination, sorting, activeFilters, setSearchParams]);

  // Build query filter for submission data
  const queryFilter: QueryFilter = {
    ...(activeFilters.company ? { company: [activeFilters.company] } : {}),
    ...(activeFilters.position ? { position: [activeFilters.position] } : {}),
    ...(activeFilters.location ? { location: [activeFilters.location] } : {}),
    ...(sorting.length > 0 ? {
      sort: {
        field: sorting[0].id,
        direction: sorting[0].desc ? 'desc' : 'asc'
      }
    } : {}),
    // Use skip instead of page and limit instead of pageSize
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize
  };

  const submissionsQuery = useQuery({
    ...getSubmissionsOptions({
      query: queryFilter
    }),
    keepPreviousData: true
  });

  const handleFilterSubmit = (data: ActiveFilters): void => {
    setActiveFilters({
      company: data.company,
      position: data.position,
      location: data.location
    });

    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Handle clearing a specific filter
  const handleClearFilter = (field: keyof ActiveFilters): void => {
    setActiveFilters(prev => ({ ...prev, [field]: null }));

    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination: PaginationState): void => {
    setPagination(newPagination);
  };

  // Handle sorting change
  const handleSortingChange = (newSorting: SortingState): void => {
    setSorting(newSorting);
  };

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
          {/* Filter Form */}
          <FilterForm
            initialValues={activeFilters}
            onSubmit={handleFilterSubmit}
            isLoading={submissionsQuery.isLoading}
            onRefresh={submissionsQuery.refetch}
            selectedFilters={activeFilters}
            onClearFilter={handleClearFilter}
          />

          {/* Submissions Table */}
          {submissionsQuery.isLoading && !submissionsQuery.data ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <SubmissionsTable
              submissions={submissionsQuery.data?.data || []}
              totalCount={submissionsQuery.data?.count || 0}
              pagination={pagination}
              setPagination={handlePaginationChange}
              sorting={sorting}
              setSorting={handleSortingChange}
              isLoading={submissionsQuery.isLoading}
              isError={submissionsQuery.isError}
            />
          )}
        </Paper>

        <Paper elevation={1} sx={{ p: 2, mt: 4, borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Note: All compensation data is self-reported by students. Data is updated weekly.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
