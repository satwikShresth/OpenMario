import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';
import { type Submission } from '#/types';
import { getSubmissionsOptions } from '#client/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import { useSubmissionsStore } from '#/stores';
import Pagination from './Pagination';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, } from '@dnd-kit/sortable';
import { TableConfig } from './types';
import SortableHeaderCell from './HeaderCell';
import FilterDrawer from './FilterDrawer';


const SubmissionsTable: React.FC = () => {
  const { distinct, skip, limit, company, position, location, year, program_level, coop_cycle, coop_year } = useSubmissionsStore();
  const isNavigating = useRef(false);

  const submissionsQuery = useQuery({
    ...getSubmissionsOptions({
      query: {
        skip,
        limit,
        company,
        location,
        position,
        coop_cycle,
        coop_year,
        year,
        distinct,
        program_level
      }
    }),
    placeholderData: previousData => previousData,
    refetchOnWindowFocus: false
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const defaultColumns = useMemo<ColumnDef<Submission>[]>(() => TableConfig, []);

  useEffect(() => {
    if (defaultColumns.length > 0 && columnOrder.length === 0) {
      const initialOrder = defaultColumns
        .map(col => {
          const id = (col.accessorKey as string) || (col.id as string);
          return id ? id : null;
        })
        .filter(Boolean);
      setColumnOrder(initialOrder);
    }
  }, [defaultColumns]);

  const columns = useMemo(() => {
    if (columnOrder.length === 0) return defaultColumns;

    const columnMap = {};
    defaultColumns.forEach(col => {
      const key = (col.accessorKey as string) || (col.id as string);
      if (key) {
        columnMap[key] = col;
      }
    });

    return columnOrder
      .map(id => columnMap[id])
      .filter(Boolean);
  }, [defaultColumns, columnOrder]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
    <Paper elevation={5} sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <DndContext
                key={headerGroup.id}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  <TableRow>
                    {headerGroup.headers.map((header, index) => (
                      <SortableHeaderCell
                        key={header.id}
                        header={header}
                        index={index}
                      />
                    ))}
                  </TableRow>
                </SortableContext>
              </DndContext>
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
