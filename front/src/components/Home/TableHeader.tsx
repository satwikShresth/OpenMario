import { TableRow } from "@mui/material";
import HeaderCell from "./HeaderCell";

const TableHeaderComponent = ({ headerGroup }) => {
  return (
    <TableRow>
      {headerGroup.headers.map((header) => (
        <HeaderCell
          key={header.id}
          header={header}
        />
      ))}
    </TableRow>
  );
};

export default TableHeaderComponent;
