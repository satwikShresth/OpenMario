import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';


const LinearProgressBar = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading && (
    <LinearProgress
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: 'rgb(31, 41, 55)',
        '& .MuiLinearProgress-bar': {
          backgroundColor: 'rgb(59, 130, 246)'
        }
      }}
    />
  )

}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
}

export function DataTable<TData>({ data, columns, isLoading = false }: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <TableContainer
      component={Paper}
      sx={{
        mb: 4,
        backgroundColor: 'black',
        border: '3px solid rgb(229, 231, 235)',
        borderRadius: '8px',
        position: 'relative',
      }}
    >
      <LinearProgressBar isLoading={isLoading} />
      {!data.length ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
          }}
        >
          <Typography sx={{ color: 'rgb(156, 163, 175)' }}>
            No data available
          </Typography>
        </Box>
      ) : (
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'rgb(243, 244, 246)',
                      color: 'rgb(17, 24, 39)'
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                sx={{
                  '&:hover': { bgcolor: 'rgb(31, 41, 55)' },
                  borderBottom: '1px solid rgb(229, 231, 235)'
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    sx={{
                      color: 'white',
                      padding: '16px 24px',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}

interface TableSectionProps<TData> {
  title: string;
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchValue: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder: string;
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading?: boolean;
}

export function TableSection<TData>({
  title,
  data,
  columns,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  inputRef,
  isLoading = false
}: TableSectionProps<TData>) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'white' }}>{title}</Typography>
        <TextField
          inputRef={inputRef}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
          size="small"
          sx={{
            width: '25%',
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': {
                borderColor: 'rgb(229, 231, 235)',
              },
              '&:hover fieldset': {
                borderColor: 'rgb(229, 231, 235)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgb(59, 130, 246)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
            },
            '& input::placeholder': {
              color: 'rgb(156, 163, 175)',
              opacity: 1,
            }
          }}
        />
      </Box>
      <DataTable<TData> data={data} columns={columns} isLoading={isLoading} />
    </Box>
  );
}
