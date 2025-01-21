import { useEffect, useState } from 'react';
import { BooksService, AuthorsService } from '#client/sdk.gen';
import type { Book, Author } from '#client/types.gen';

export default () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksResponse, authorsResponse] = await Promise.all([
          BooksService.getBooks(),
          AuthorsService.getAuthors()
        ]);

        setBooks(booksResponse.data!);
        setAuthors(authorsResponse.data!);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  const getAuthorNameById = (authorId: number) => {
    const author = authors.find(a => a.id === authorId);
    return author ? author.name : 'Unknown Author';
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Library Data</h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Books</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Publication Year</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Genre</th>
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
          <h3 className="text-xl font-semibold mb-4">Authors</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Biography</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {authors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-800 text-white">
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
  );
};
