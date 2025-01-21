import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postAuthorsMutation, type AuthorCreate } from '#client';

interface ErrorData {
  name?: string | null;
  bio?: string | null;
}

export default function AuthorForm() {
  const [formData, setFormData] = useState<AuthorCreate>({
    name: '',
    bio: ''
  });
  const [errors, setErrors] = useState<ErrorData>({ name: null, bio: null });

  const mutation = useMutation(postAuthorsMutation());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        bio: formData?.bio?.trim() || null
      };

      await mutation.mutateAsync(
        { body: submissionData, throwOnError: true }
      );

      setFormData({ name: '', bio: '' });
      setErrors({});
    } catch (error: any) {
      let errorMessage = 'Error creating author. Please try again.';

      if (error.response?.status === 400 && error.response?.data?.errors?.details) {
        const newErrors = Object.fromEntries(
          error.response.data.errors.details.map(
            ({ field, message }: { field: string; message: string }) => [field, message]
          )
        );
        setErrors(newErrors);
      } else if (error.response?.status === 409) {
        errorMessage = 'An author with this name already exists.';
        setErrors({});
      } else {
        setErrors({});
      }

      console.error('Submission error:', error);
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
            value={formData?.bio!}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="Enter author biography (optional)"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create Author'}
        </button>

        {mutation.isSuccess && (
          <div className="p-3 rounded bg-green-900 text-green-200">
            Author created successfully!
          </div>
        )}

        {mutation.isError && (
          <div className="p-3 rounded bg-red-900 text-red-200">
            {mutation.error?.response?.status === 409
              ? 'An author with this name already exists.'
              : 'Error creating author. Please try again.'}
          </div>
        )}
      </form>
    </div>
  );
}
