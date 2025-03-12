import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, TableCell } from "@mui/material";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

const HeaderCell = ({ header }) => {
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
    position: 'relative' as const,
    userSelect: 'none' as const,
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
export default HeaderCell;
