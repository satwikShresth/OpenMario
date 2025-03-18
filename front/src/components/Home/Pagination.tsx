"use no memo"
import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { TableConfig } from "./types";
import React from "react";
import { useFilterStore } from "#/stores/useFilterStore";
import { getSubmissionsOptions } from "#client/react-query.gen";
import { Route } from "#/routes/home";
import { useQueryClient } from "@tanstack/react-query";

const Pagination: React.FC<{ table: Table<typeof TableConfig>, query: any }> =
  ({ table }) => {

    const query = Route.useSearch();
    const client = useQueryClient();
    const { pageIndex, pageSize } = query;
    const rowCount = table.getRowCount();
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();

    const prefetchPage = (pageIndex: number, pageSize: number) => {
      client.prefetchQuery({ ...getSubmissionsOptions({ query: { ...query, pageIndex, pageSize } }), staleTime: 6000 })
    }

    return (
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
          <Select
            value={pageSize}
            onChange={e => { table.setPageIndex(0); table.setPageSize(Number(e.target.value)) }}
            size="small"
            sx={{
              minWidth: 80
            }}
          >
            {[5, 10, 25, 50, 100].map(size => (
              <MenuItem
                key={size}
                value={size}
                onMouseEnter={(e) => {
                  const pageSize = Number(e.target.attributes["data-value"]["value"]);
                  prefetchPage(0, pageSize)
                }}
              >
                {size}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Page {pageIndex + 1} of {Math.ceil(rowCount / pageSize)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => table.firstPage()}
              onMouseEnter={() => canPreviousPage && prefetchPage(0, pageSize)}
              disabled={!canPreviousPage}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronsLeft size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => table.previousPage()}
              onMouseEnter={() => canPreviousPage && prefetchPage(pageIndex - 1, pageSize)}
              disabled={!canPreviousPage}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => table.nextPage()}
              onMouseEnter={() => canNextPage && prefetchPage(pageIndex + 1, pageSize)}
              disabled={!canNextPage}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronRight size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => table.lastPage()}
              onMouseEnter={() => canNextPage && prefetchPage(Math.ceil(rowCount / pageSize) - 1, pageSize)}
              disabled={!canNextPage}
              sx={{ minWidth: '40px', p: '4px' }}
            >
              <ChevronsRight size={18} />
            </Button>
          </Box>
        </Box>
      </Box >
    );
  };

export default Pagination;
