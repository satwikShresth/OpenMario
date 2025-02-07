import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
  getBooksOptions,
  getAuthorsOptions,
  putAuthorsByIdMutation,
  putBooksByIdMutation,
  getBooksQueryKey,
  getAuthorsQueryKey,
  deleteBooksByIdMutation,
  deleteAuthorsByIdMutation
} from '#client/react-query.gen';
import { Typography, Box } from '@mui/material';
import { BookCreateSchema } from "#client/schemas.gen";
import DataTable from '../../component/table';
import { useUserStore } from '../../hooks/useUserContext'

export default () => {
  const { user } = useUserStore()
  const [bookSearch, setBookSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [DbookSearch] = useDebounce(bookSearch, 500);
  const [DauthorSearch] = useDebounce(authorSearch, 500);

  console.log(user)

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

  const updateBookMutation = useMutation(putBooksByIdMutation());
  const updateAuthorMutation = useMutation(putAuthorsByIdMutation());
  const deleteBookMutation = useMutation(deleteBooksByIdMutation());
  const deleteAuthorMutation = useMutation(deleteAuthorsByIdMutation());

  const bookColumns = [
    { field: 'title', headerName: 'Title', flex: 1, editable: true },
    { field: 'author_name', headerName: 'Author', flex: 1 },
    { field: 'pub_year', headerName: 'Publication Year', width: 150, editable: true },
    {
      field: 'genre',
      headerName: 'Genre',
      width: 130,
      editable: true,
      type: 'singleSelect',
      valueOptions: BookCreateSchema.properties.genre.enum
    }
  ];

  const authorColumns = [
    { field: 'name', headerName: 'Name', flex: 1, editable: true },
    { field: 'bio', headerName: 'Biography', flex: 2, editable: true }
  ];

  if (error) {
    return (
      <Box p={2} color="error.main">
        Failed to fetch data
      </Box>
    );
  }

  const queryKeys = [getBooksQueryKey({ query: { title: DbookSearch } }), getAuthorsQueryKey({ query: { name: DauthorSearch } })]

  return (
    <Box p={4} sx={{ height: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Hello {user && user.username}
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        sx={{
          width: '70%',
          mx: "auto",
          backgroundColor: 'transparent'
        }}
      >
        <DataTable
          title="Books"
          rows={books}
          columns={bookColumns}
          searchField={{
            value: bookSearch,
            onChange: setBookSearch,
            placeholder: "Search books by title"
          }}
          updateMutation={updateBookMutation}
          deleteMutation={deleteBookMutation}
          queryKeys={queryKeys}
        />

        <DataTable
          title="Authors"
          rows={authors}
          columns={authorColumns}
          searchField={{
            value: authorSearch,
            onChange: setAuthorSearch,
            placeholder: "Search authors by name"
          }}
          updateMutation={updateAuthorMutation}
          deleteMutation={deleteAuthorMutation}
          queryKeys={queryKeys}
        />
      </Box>
    </Box>
  );
};
