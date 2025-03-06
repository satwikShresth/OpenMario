import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from '@mui/material';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { type Submission } from '#/types';
import { getSubmissionsOptions } from '#client/react-query.gen';
import { useQuery } from '@tanstack/react-query';
import { useSubmissionsStore } from '#/stores';
import Pagination from './Pagination';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable header cell component
function SortableHeaderCell({ header }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as 'relative',
    userSelect: 'none' as 'none',
  };

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      sx={{
        fontWeight: 'bold',
        width: header.getSize() !== 150 ? header.getSize() : undefined
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          {...attributes}
          {...listeners}
          sx={{
            cursor: 'grab',
            marginRight: 1,
            display: 'flex',
            alignItems: 'center',
            ':hover': { opacity: 0.2 },
          }}
        >
          <GripVertical size={14} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            width: '90%',
          }}
          onClick={header.column.getToggleSortingHandler()}
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
          {header.column.getIsSorted() === false ? null :
            header.column.getIsSorted() === 'desc' ?
              <ChevronDown size={12} style={{ marginLeft: 4 }} /> :
              <ChevronUp size={12} style={{ marginLeft: 4 }} />
          }
        </Box>
      </Box>
    </TableCell>
  );
}

const SubmissionsTable: React.FC = () => {
  const { skip, limit } = useSubmissionsStore();
  const isNavigating = useRef(false);

  const submissionsQuery = useQuery({
    ...getSubmissionsOptions({ query: { skip, limit } }),
    placeholderData: previousData => previousData,
    refetchOnWindowFocus: false
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const defaultColumns = useMemo<ColumnDef<Submission>[]>(
    () => [
      {
        accessorKey: 'company',
        header: 'Company',
      },
      {
        accessorKey: 'position',
        header: 'Position',
      },
      {
        accessorKey: 'compensation',
        header: 'Wage',
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return `$${value.toLocaleString()}`;
        },
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
        accessorKey: 'year',
        header: 'Year',
        size: 80,
      },
      {
        accessorKey: 'coop_year',
        header: 'Co-op Year',
        size: 135,
      },
      {
        accessorKey: 'coop_cycle',
        header: 'Cycle',
      },
    ],
    []
  );

  // Initialize column order on first render
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

  // Get ordered columns
  const columns = useMemo(() => {
    if (columnOrder.length === 0) return defaultColumns;

    // Create a map of columns by id/key for easy lookup
    const columnMap = {};
    defaultColumns.forEach(col => {
      const key = (col.accessorKey as string) || (col.id as string);
      if (key) {
        columnMap[key] = col;
      }
    });

    // Return columns in the order specified by columnOrder
    return columnOrder
      .map(id => columnMap[id])
      .filter(Boolean); // Remove any undefined values
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

  // Set up sensors for drag and drop
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

  // Handle drag end event
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
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
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
