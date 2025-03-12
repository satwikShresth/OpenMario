import { TableRow, TableCell, Typography } from "@mui/material";
import { flexRender } from "@tanstack/react-table";

const TableBodyComponent = ({ rows, isLoading, columnLength }) => {
  if (isLoading && rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columnLength} align="center" sx={{ py: 3 }}>
          <Typography>Loading...</Typography>
        </TableCell>
      </TableRow>
    );
  }

  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columnLength} align="center" sx={{ py: 3 }}>
          No results found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {rows.map(row => (
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
      ))}
    </>
  );
};

export default TableBodyComponent;
