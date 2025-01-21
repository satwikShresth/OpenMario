import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { BookCreate } from '#client/types.gen';
import { BookCreateSchema } from '#client/schemas.gen';
import { postBooksMutation } from '#client/react-query.gen';

interface ErrorData {
  title?: string | null;
  pub_year?: string | null;
  genre?: string | null;
  author_name?: string | null;
  author_bio?: string | null;
}

export default () => {
  const [formData, setFormData] = useState<BookCreate>({
    title: '',
    pub_year: '',
    genre: 'Fiction',
    author_name: '',
    author_bio: ''
  });
  const [errors, setErrors] = useState<ErrorData>({});
  const [status, setStatus] = useState('');

  const GENRES = BookCreateSchema?.properties?.genre?.enum;

  const mutation = useMutation(postBooksMutation());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setStatus('Submitting...');
      setErrors({});

      const submissionData = {
        ...formData,
        author_bio: formData?.author_bio?.trim() || null
      };

      const response = await mutation.mutateAsync({
        body: submissionData,
        throwOnError: true
      });

      if (response) {
        setStatus('Book created successfully!');
        setFormData({
          title: '',
          pub_year: '',
          genre: 'Fiction',
          author_name: '',
          author_bio: ''
        });
      }
    } catch (error: any) {
      let errorMessage = 'Error creating book. Please try again.';

      if (error.response?.status === 400 && error.response?.data?.errors?.details) {
        const newErrors = Object.fromEntries(
          error.response.data.errors.details.map(
            ({ field, message }: { field: string; message: string }) => [field, message]
          )
        );
        setErrors(newErrors);
      } else if (error.response?.status === 409) {
        errorMessage = 'A book with this title already exists.';
      } else {
        setErrors({});
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      setStatus(errorMessage);
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 p-8 rounded-lg bg-gray-900">
        <h2 className="text-2xl font-bold text-white">Create Book</h2>

        <div className="space-y-2">
          <label htmlFor="title" className="block text-gray-200">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter book title"
          />
          {errors.title && (
            <div className="text-red-500 text-sm">{errors.title}</div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="author_name" className="block text-gray-200">
            Author Name
          </label>
          <input
            id="author_name"
            type="text"
            name="author_name"
            value={formData.author_name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter author name"
          />
          {errors.author_name && (
            <div className="text-red-500 text-sm">{errors.author_name}</div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="pub_year" className="block text-gray-200">
            Publication Year
          </label>
          <input
            id="pub_year"
            type="text"
            name="pub_year"
            value={formData.pub_year}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="YYYY"
            maxLength={4}
            pattern="\d{4}"
          />
          {errors.pub_year && (
            <div className="text-red-500 text-sm">{errors.pub_year}</div>
          )}
        </div>

        <div className="space-y-4">
          <label htmlFor="genre" className="block text-gray-200">
            Genre
          </label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className="w-full h-9 rounded bg-gray-700 text-white"
          >
            {GENRES?.map(genre => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          {errors.genre && (
            <div className="text-red-500 text-sm">{errors.genre}</div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="author_bio" className="block text-gray-200">
            Author Bio
          </label>
          <textarea
            id="author_bio"
            name="author_bio"
            value={formData?.author_bio!}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter author biography (optional)"
          />
          {errors.author_bio && (
            <div className="text-red-500 text-sm">{errors.author_bio}</div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create Book'}
        </button>

        {status && (
          <div
            className={`p-3 rounded ${status.includes('successfully')
              ? 'bg-green-900 text-green-200'
              : status === 'Submitting...'
                ? 'bg-gray-800 text-gray-200'
                : 'bg-red-900 text-red-200'
              }`}
          >
            {status}
          </div>
        )}
      </form>
    </div>
  );
};
