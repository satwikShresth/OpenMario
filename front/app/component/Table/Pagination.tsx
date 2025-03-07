import { useCallback } from "react";
import { useSubmissionsStore } from '#/stores';
import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Pagination: React.FC<{ totalCount: number, isLoading: boolean }> = ({ totalCount, isLoading }) => {
  const { skip, limit, gotoFirstPage, gotoPreviousPage, gotoNextPage, gotoLastPage, handleChangeRowsPerPage } = useSubmissionsStore();

  const pageCount = Math.ceil(totalCount / limit) || 1;
  const pageIndex = Math.floor(skip / limit) || 0;
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const handleFirstPageClick = useCallback(() => gotoFirstPage(), []);
  const handlePreviousPageClick = useCallback(() => gotoPreviousPage(skip, limit), [skip, limit]);
  const handleNextPageClick = useCallback(() => gotoNextPage(skip, limit), [skip, limit]);
  const handleLastPageClick = useCallback(() => gotoLastPage(totalCount, limit), [totalCount, limit]);



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
          value={limit}
          onChange={handleChangeRowsPerPage}
          size="small"
          sx={{
            minWidth: 80
          }}
        >
          {[5, 10, 25, 50, 100].map(pageSize => (
            <MenuItem key={pageSize} value={pageSize}>
              {pageSize}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          Page {pageIndex + 1} of {pageCount}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleFirstPageClick}
            disabled={!canPreviousPage || isLoading}
            sx={{ minWidth: '40px', p: '4px' }}
          >
            <ChevronsLeft size={18} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePreviousPageClick}
            disabled={!canPreviousPage || isLoading}
            sx={{ minWidth: '40px', p: '4px' }}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleNextPageClick}
            disabled={!canNextPage || isLoading}
            sx={{ minWidth: '40px', p: '4px' }}
          >
            <ChevronRight size={18} />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleLastPageClick}
            disabled={!canNextPage || isLoading}
            sx={{ minWidth: '40px', p: '4px' }}
          >
            <ChevronsRight size={18} />
          </Button>
        </Box>
      </Box>
    </Box>
  )
};

export default Pagination;
