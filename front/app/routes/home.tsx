import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { getBooksOptions, getAuthorsOptions, putAuthorsByIdMutation, putBooksByIdMutation, getBooksQueryKey, getAuthorsQueryKey } from '#client/react-query.gen';
import { DataGrid, type GridRowModel } from '@mui/x-data-grid';
import { TextField, Typography, Box, Paper } from '@mui/material';
import type { Author, Book } from '#client/types.gen';

export default () => {
  const [bookSearch, setBookSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [DbookSearch] = useDebounce(bookSearch, 500);
  const [DauthorSearch] = useDebounce(authorSearch, 500);
  const queryClient = useQueryClient();

  const {
    data: books = [],
    error: booksError,
  } = useQuery({
    ...getBooksOptions({ query: { title: DbookSearch } }),
    enabled: true
  });

  const {
    data: authors = [],
    error: authorsError,
  } = useQuery({
    ...getAuthorsOptions({ query: { name: DauthorSearch } }),
    enabled: true
  });

  const error = booksError || authorsError;

  if (error) {
    return (
      <Box p={2} color="error.main">
        Failed to fetch data
      </Box>
    );
  }

  const updateBookMutation = useMutation(putBooksByIdMutation());
  const updateAuthorMutation = useMutation(putAuthorsByIdMutation());


  const handleBookEdit = (newRow: GridRowModel<Book>) => {
    updateBookMutation.mutateAsync({
      path: { id: newRow.id },
      //@ts-ignore
      body: { id: newRow.id, title: newRow.title, genre: newRow.genre, pub_year: newRow.pub_year },
      throwOnError: true
    },
      {
        onError: (error) => {
          window.alert(`Error updating Book`); console.error(error)
        }
      },
    )
      .catch((error) => console.error(`Error: ${error}`))
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: getAuthorsQueryKey({ query: { name: DauthorSearch } }) })
        queryClient.invalidateQueries({ queryKey: getBooksQueryKey({ query: { title: DbookSearch } }) })
      });

    return newRow;
  };

  const handleAuthorEdit = (newRow: GridRowModel<Author>) => {
    updateAuthorMutation.mutateAsync({
      path: { id: newRow.id },
      body: newRow,
      throwOnError: true
    },
      {
        onError: (error) => {
          window.alert(`Error updating Author`); console.error(error)
        }
      },
    )
      .catch((error) => console.error(`Error: ${error}`))
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: getAuthorsQueryKey({ query: { name: DauthorSearch } }) })
        queryClient.invalidateQueries({ queryKey: getBooksQueryKey({ query: { title: DbookSearch } }) })
      });

    return newRow;
  };

  const bookColumns = [
    { field: 'title', headerName: 'Title', flex: 1, editable: true },
    { field: 'author_name', headerName: 'Author', flex: 1 },
    { field: 'pub_year', headerName: 'Publication Year', width: 150, editable: true },
    { field: 'genre', headerName: 'Genre', width: 130, editable: true }
  ];

  const authorColumns = [
    { field: 'name', headerName: 'Name', flex: 1, editable: true },
    { field: 'bio', headerName: 'Biography', flex: 2, editable: true }
  ];

  return (
    <Box p={4} sx={{ height: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Library Data
      </Typography>

      <Box display="flex" flexDirection="column" gap={4} sx={{ width: '70%', mx: "auto", backgroundColor: 'transparent' }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Books</Typography>
            <TextField
              placeholder="Search books by title"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              size="small"
              sx={{ width: '25%' }}
            />
          </Box>
          <DataGrid
            rows={books}
            columns={bookColumns}
            getRowId={(row) => row.id || `${row.title}-${row.author_id}`}
            autoHeight
            pageSizeOptions={[5, 10, 25]}
            editMode="row"
            processRowUpdate={handleBookEdit}
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

        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Authors</Typography>
            <TextField
              placeholder="Search authors by name"
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              size="small"
              sx={{ width: '25%' }}
            />
          </Box>
          <DataGrid
            rows={authors}
            getRowId={(row) => row.id || row.name}
            columns={authorColumns}
            autoHeight
            pageSizeOptions={[5, 10, 25]}
            editMode="row"
            processRowUpdate={handleAuthorEdit}
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
      </Box>
    </Box>
  );
};
