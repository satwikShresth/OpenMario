import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DataGrid,
  GridActionsCellItem,
  GridRowModes,
  type GridEventListener,
  GridRowEditStopReasons,
  type GridRowModesModel,
  type GridRowModel,
  type GridColDef
} from '@mui/x-data-grid';
import { TextField, Typography, Box, Paper } from '@mui/material';
import { Pencil as EditIcon, Save as SaveIcon, X as CancelIcon, CircleX as DeleteIcon } from 'lucide-react';

interface DataTableProps<T> {
  title: string;
  rows: T[];
  columns: GridColDef[];
  searchField?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  updateMutation: any;
  deleteMutation: any;
  queryKeys: any[];
}

export default function DataTable<T>({
  title,
  rows,
  columns: baseColumns,
  searchField,
  updateMutation,
  deleteMutation,
  queryKeys
}: DataTableProps<T>) {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const queryClient = useQueryClient();

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: number) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleDeleteClick = (id: number) => () => {
    deleteMutation.mutateAsync({
      path: { id },
      throwOnError: true
    })
      .catch((error: Error) => {
        console.error(error);
        window.alert('Error deleting the item');
      })
      .finally(() => {
        queryKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });

      });
  };

  const handleEdit = (newRow: GridRowModel) => {
    updateMutation.mutateAsync({
      path: { id: newRow.id },
      body: newRow,
      throwOnError: true
    })
      .catch((error: Error) => {
        console.error(error);
        window.alert('Error updating the row');
      })
      .finally(() => {
        queryKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      });

    return newRow;
  };

  const actions = {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    cellClassName: 'actions',
    getActions: ({ id }: { id: number }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={<SaveIcon />}
            label="Save"
            sx={{ color: 'primary.main' }}
            onClick={handleSaveClick(id)}
          />,
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={handleCancelClick(id)}
            color="inherit"
          />,
        ];
      }

      return [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={handleEditClick(id)}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          className="textPrimary"
          onClick={handleDeleteClick(id)}
          color="inherit"
        />,
      ];
    },
  };

  const columns = [...baseColumns, actions];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{title}</Typography>
        {searchField && (
          <TextField
            placeholder={searchField.placeholder}
            value={searchField.value}
            onChange={(e) => searchField.onChange(e.target.value)}
            size="small"
            sx={{ width: '25%' }}
          />
        )}
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row: any) => row.id || row.name}
        autoHeight
        pageSizeOptions={[5, 10, 25]}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={handleEdit}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        sx={{
          border: '1px solid white',
          color: 'white',
          '& .MuiDataGrid-cell': {
            color: 'black',
            borderBottom: '1px solid rgba(255, 255, 255, 0.4)'
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'white',
            color: 'black',
            borderBottom: '2px solid rgba(255, 255, 255, 0.8)'
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }
          }
        }}
      />
    </Paper>
  );
}
