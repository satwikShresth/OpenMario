import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender, type ColumnDef, type PaginationState, type SortingState } from '@tanstack/react-table';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button } from '@mui/material';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Submission {
  year: number;
  coop_year: string;
  coop_cycle: string;
  company: string;
  position: string;
  location_city: string;
  location_state_code: string;
  program_level: string;
  work_hours: string;
  compensation: number;
  [key: string]: any;
}

interface SubmissionsTableProps {
  submissions: Submission[];
  totalCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  isLoading: boolean;
  isError: boolean;
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  totalCount,
  pagination,
  setPagination,
  sorting,
  setSorting,
  isLoading,
  isError
}) => {
  // Define table columns
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

  // Calculate page count based on the total count from the server
  const pageCount = Math.ceil(totalCount / pagination.pageSize) || 1;

  // Initialize the table
  const table = useReactTable({
    data: submissions,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // Check if we can go to next/previous pages
  const canPreviousPage = pagination.pageIndex > 0;
  const canNextPage = pagination.pageIndex < pageCount - 1;

  // Handle pagination actions
  const handleFirstPage = (): void => {
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handlePreviousPage = (): void => {
    if (canPreviousPage) {
      setPagination({ ...pagination, pageIndex: pagination.pageIndex - 1 });
    }
  };

  const handleNextPage = (): void => {
    if (canNextPage) {
      setPagination({ ...pagination, pageIndex: pagination.pageIndex + 1 });
    }
  };

  const handleLastPage = (): void => {
    setPagination({ ...pagination, pageIndex: pageCount - 1 });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setPagination({
      pageIndex: 0,
      pageSize: parseInt(event.target.value, 10),
    });
  };

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error loading data. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Main table */}
      <TableContainer sx={{ maxHeight: 600 }}>
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
            {isLoading && table.getRowModel().rows.length === 0 ? (
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

      {/* Custom Pagination Controls */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderTop: '1px solid rgba(224, 224, 224, 1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Rows per page:
          </Typography>
          <select
            value={pagination.pageSize}
            onChange={handleChangeRowsPerPage}
            style={{
              padding: '5px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.23)'
            }}
          >
            {[5, 10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Page {pagination.pageIndex + 1} of {pageCount}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleFirstPage}
              disabled={!canPreviousPage || isLoading}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronsLeft size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePreviousPage}
              disabled={!canPreviousPage || isLoading}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleNextPage}
              disabled={!canNextPage || isLoading}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronRight size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleLastPage}
              disabled={!canNextPage || isLoading}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronsRight size={18} />
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SubmissionsTable;
