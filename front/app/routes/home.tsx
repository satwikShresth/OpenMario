import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import {
  getBooksOptions,
  getAuthorsOptions,
  deleteBooksByIdMutation,
  deleteAuthorsByIdMutation,
  getAuthorsQueryKey,
  getBooksQueryKey
} from '#client/react-query.gen';
import { createColumnHelper } from '@tanstack/react-table';
import {
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { X } from 'lucide-react';
import type { Book, Author } from '#client/types.gen';
import { TableSection } from '#/components/Table';
import type { AxiosError } from 'axios';


export default function LibraryData() {
  const queryClient = useQueryClient();
  const [bookSearch, setBookSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [DbookSearch] = useDebounce(bookSearch, 500);
  const [DauthorSearch] = useDebounce(authorSearch, 500);

  const bookInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);

  const {
    data: books = [],
    isLoading: booksLoading,
    error: booksError,
  } = useQuery({
    ...getBooksOptions({
      query: {
        title: DbookSearch
      }
    }),
    enabled: true
  });

  const {
    data: authors = [],
    isLoading: authorsLoading,
    error: authorsError,
  } = useQuery({
    ...getAuthorsOptions({
      query: {
        name: DauthorSearch
      }
    }),
    enabled: true
  });

  const deleteBookMutation = useMutation({
    ...deleteBooksByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getBooksQueryKey()
      });
    },
    onError: (error) => {
      window.alert(error?.response?.data.message! ?? 'Failed to delete book');
    }
  });

  const deleteAuthorMutation = useMutation({
    ...deleteAuthorsByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getAuthorsQueryKey()
      });
    },
    onError: (error) => {
      window.alert(error?.response?.data.message! ?? 'Failed to delete author');
    }
  });

  const handleDeleteBook = (bookId: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBookMutation.mutate({
        path: {
          id: bookId
        }
      });
    }
  };

  const handleDeleteAuthor = (authorId: number) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      deleteAuthorMutation.mutate({
        path: {
          id: authorId
        }
      });
    }
  };

  const columnHelper = createColumnHelper<Book>();

  const bookColumns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('author_id', {
      header: 'Author',
      cell: info => {
        const author = authors.find(a => a.id === info.getValue());
        return author ? author.name : 'Unknown Author';
      }
    }),
    columnHelper.accessor('pub_year', {
      header: 'Publication Year',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('genre', {
      header: 'Genre',
      cell: info => info.getValue()
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: props => (
        <IconButton
          onClick={() => handleDeleteBook(props.row.original.id)}
          size="small"
          sx={{
            color: 'white',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'rgba(211, 47, 47, 0.04)'
            }
          }}
        >
          <X />
        </IconButton>
      )
    })
  ];

  const authorColumnHelper = createColumnHelper<Author>();

  const authorColumns = [
    authorColumnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue()
    }),
    authorColumnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue()
    }),
    authorColumnHelper.accessor('bio', {
      header: 'Biography',
      cell: info => info.getValue() || 'No biography available'
    }),
    authorColumnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: props => (
        <IconButton
          onClick={() => handleDeleteAuthor(props.row.original.id)}
          size="small"
          sx={{
            color: 'white',
            '&:hover': {
              color: 'error.main',
              bgcolor: 'rgba(211, 47, 47, 0.04)'
            }
          }}
        >
          <X />
        </IconButton>
      )
    })
  ];

  const error = booksError || authorsError;
  if (error) {
    return (
      <Box sx={{ p: 2, color: 'error.main' }}>
        Failed to fetch data
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
        Library Data
      </Typography>

      <Box sx={{ maxWidth: '80%', minWidth: '60%', mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <TableSection<Book>
            title="Books"
            data={books}
            columns={bookColumns}
            searchValue={bookSearch}
            onSearchChange={(e) => setBookSearch(e.target.value)}
            searchPlaceholder="Search books by title"
            inputRef={bookInputRef}
            isLoading={booksLoading}
          />
        </Box>

        <TableSection<Author>
          title="Authors"
          data={authors}
          columns={authorColumns}
          searchValue={authorSearch}
          onSearchChange={(e) => setAuthorSearch(e.target.value)}
          searchPlaceholder="Search authors by name"
          inputRef={authorInputRef}
          isLoading={authorsLoading}
        />
      </Box>
    </Box>
  );
}
