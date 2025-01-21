import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBooksOptions, getAuthorsOptions } from '#client';
import { useDebounce } from 'use-debounce';


export default () => {
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

  const loading = booksLoading || authorsLoading;
  const error = booksError || authorsError;

  const handleBookSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookSearch(e.target.value);
  };

  const handleAuthorSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthorSearch(e.target.value);
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to fetch data
      </div>
    );
  }

  const getAuthorNameById = (authorId: number) => {
    const author = authors.find(a => a.id === authorId);
    return author ? author.name : 'Unknown Author';
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-6">Library Data</h2>

      <div className='flex justify-center max-w-full min-w-[70%]'>
        <div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Books</h3>
              <div className="relative w-1/4">
                <input
                  ref={bookInputRef}
                  type="text"
                  placeholder="Search books by title"
                  value={bookSearch}
                  onChange={handleBookSearch}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-ellipsis"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded">
              <table className="border-[3px] border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Author</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Publication Year</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Genre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-800 text-white">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{book.id}</td>
                      <td className="px-6 py-4 text-sm text-white">{book.title}</td>
                      <td className="px-6 py-4 text-sm text-white">{getAuthorNameById(book.author_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{book.pub_year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{book.genre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Authors</h3>
              <div className="relative w-1/4">
                <input
                  ref={authorInputRef}
                  type="text"
                  placeholder="Search authors by name"
                  value={authorSearch}
                  onChange={handleAuthorSearch}
                  className="px-4 py-2 border w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-ellipsis"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded">
              <table className="min-w-full border-[3px] border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr className="rounded-lg">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Biography</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {authors.map((author) => (
                    <tr key={author.id} className="hover:bg-gray-800 text-white rounded">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{author.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{author.name}</td>
                      <td className="px-6 py-4 text-sm text-white">
                        {author.bio || 'No biography available'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
