import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button, Select, MenuItem } from '@mui/material';
import { ChevronUp, ChevronDown, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { type Submission } from '#/types';
import { getSubmissionsOptions } from '#client/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import { useSubmissionsStore } from '#/stores';
import Pagination from './Pagination';


const SubmissionsTable: React.FC = () => {
  const { skip, limit } = useSubmissionsStore();

  const isNavigating = useRef(false);

  const submissionsQuery = useQuery({
    ...getSubmissionsOptions({ query: { skip, limit } }),
    placeholderData: previousData => previousData,
    refetchOnWindowFocus: false
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        accessorKey: 'year',
        header: 'Year',
        size: 80,
      },
      {
        accessorKey: 'coop_year',
        header: 'Co-op Year',
      },
      {
        accessorKey: 'coop_cycle',
        header: 'Co-op Cycle',
      },
      {
        accessorKey: 'company',
        header: 'Company',
      },
      {
        accessorKey: 'position',
        header: 'Position',
      },
      {
        accessorFn: (row) => `${row.location_city}, ${row.location_state_code}`,
        id: 'location',
        header: 'Location',
      },
      {
        accessorKey: 'program_level',
        header: 'Program',
        size: 120,
      },
      {
        accessorKey: 'work_hours',
        header: 'Hours',
        size: 100,
      },
      {
        accessorKey: 'compensation',
        header: 'Compensation',
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return `$${value.toLocaleString()}`;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: submissionsQuery?.data?.data || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
  });

  useEffect(() => {
    if (!submissionsQuery.isLoading && !submissionsQuery.isFetching) {
      isNavigating.current = false;
    }
  }, [submissionsQuery.isLoading, submissionsQuery.isFetching]);


  if (submissionsQuery.isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading data. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 'bold',
                      width: header.getSize() !== 150 ? header.getSize() : undefined
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === false ? null :
                          header.column.getIsSorted() === 'desc' ?
                            <ChevronDown size={16} style={{ marginLeft: 4 }} /> :
                            <ChevronUp size={16} style={{ marginLeft: 4 }} />
                        }
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {submissionsQuery.isLoading && table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  hover
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination totalCount={submissionsQuery?.data?.count || 0} isLoading={submissionsQuery.isLoading} />

    </Paper>
  );
};

export default SubmissionsTable;
