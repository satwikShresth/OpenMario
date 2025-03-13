"use no memo"
// Table.jsx
import { useState, useEffect, useMemo } from 'react';
import { Table, TableContainer, TableHead, TableBody, Paper } from '@mui/material';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Pagination from './Pagination';
import { TableConfig } from './types';
import TableHeaderComponent from './TableHeader';
import TableBodyComponent from './TableBody';
import { useFilterStore } from '#/stores';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getSubmissionsOptions } from '#client/react-query.gen';
import { Route } from "#/routes/home";


const DataTable = () => {

  const query = Route.useSearch();

  const [sorting, setSorting] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const defaultColumns = useMemo(() => TableConfig, []);
  const { setPagination, pageIndex, pageSize } = useFilterStore();

  const submissionsQuery = useQuery({
    ...getSubmissionsOptions({
      query
    }),
    placeholderData: previousData => previousData,
    staleTime: 3000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (defaultColumns.length > 0 && columnOrder.length === 0) {
      const initialOrder = defaultColumns
        .map(col => {
          const id = (col.accessorKey) || (col.id);
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
      const key = (col.accessorKey) || (col.id);
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
      pagination: {
        pageSize,
        pageIndex
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: false,
    manualPagination: true,
    pageCount: Math.ceil(submissionsQuery?.data?.count / pageSize),
    rowCount: submissionsQuery?.data?.count,
    onPaginationChange: setPagination,
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

  return (
    <Paper elevation={5} sx={{ overflow: 'hidden', mb: 4 }}>
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
                  <TableHeaderComponent
                    headerGroup={headerGroup}
                  />
                </SortableContext>
              </DndContext>
            ))}
          </TableHead>
          <TableBody>
            <TableBodyComponent
              rows={table.getRowModel().rows}
              isLoading={submissionsQuery.isPending}
              columnLength={columns.length}
            />
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination table={table} query={query} />
    </Paper>
  );
};

export default DataTable;
