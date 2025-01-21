import { useState } from 'react';
import { AuthorsService } from '#client/sdk.gen';
import type { AuthorCreate } from "#client/types.gen";

export default () => {
  const [formData, setFormData] = useState<AuthorCreate>({
    name: '',
    bio: null
  });
  const [errors, setErrors] = useState<{ name?: string | null, bio?: string | null }>({ name: null, bio: null });
  const [status, setStatus] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setStatus('Submitting...');
        const response = await AuthorsService.postAuthors<true>({
          body: formData,
          throwOnError: true
        });

        if (response.data) {
          setStatus('Author created successfully!');
          setFormData({ name: '', bio: null });
        }

      } catch (error: any) {
        let errorMessage = 'Error creating author. Please try again.';

        if (error.response?.status === 400 && error.response?.data?.errors?.details) {
          setErrors(
            Object.fromEntries(
              error.response.data.errors.details.map(({ field, message }: { field: string; message: string }) => [field, message])
            )
          );
        } else if (error.response?.status === 409) {
          errorMessage = 'An author with this name already exists.';
        } else {
          setErrors({});
          errorMessage = 'An unexpected error occurred. Please try again.';
        }

        setStatus(errorMessage);
        console.error('Submission error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-10 p-8 rounded-lg bg-gray-900">
        <h2 className="text-2xl font-bold text-white">Create Author</h2>

        <div className="space-y-2">
          <label htmlFor="name" className="block text-gray-200">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter author name"
          />
          {errors.name && (
            <div className="text-red-500 text-sm">{errors.name}</div>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-gray-200">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter author biography (optional)"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Create Author
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
