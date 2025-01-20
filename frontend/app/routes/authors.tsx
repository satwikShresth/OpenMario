import type { Route } from "./+types/home";
import { useState, useEffect } from 'react';
import { AuthorsService } from '#client/sdk.gen';
import type { Author } from "#client/types.gen";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Authors" },
    { name: "description", content: "Database interaction for Authors table" },
  ];
}

export default () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [message, setMessage] = useState('');

  const sampleAuthors = [
    { name: "Jane Austen", bio: "English novelist known for Pride and Prejudice" },
    { name: "George Orwell", bio: "Author of 1984 and Animal Farm" },
    { name: "Virginia Woolf", bio: "Modernist author and essayist" }
  ];

  const setupAuthors = async () => {
    try {
      // Create sample authors
      for (const author of sampleAuthors) {
        await AuthorsService.postAuthors({
          body: author
        });
      }
      setMessage('Sample authors created');
    } catch (err) {
      console.error('Error:', err);
      setMessage('Error creating or fetching authors');
    }
  };


  const fetchAuthors = async () => {
    try {
      const response: { data?: Author[] } = await AuthorsService.getAuthors();
      setAuthors(response.data!);
    } catch (err) {
      console.error('Error:', err);
    }
  };


  useEffect(() => {
    setupAuthors();
    fetchAuthors();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Authors</h1>
      <div className="space-y-2">
        {authors.map((author: Author) => (
          <div key={author.id} className="p-2 border rounded">
            <h2 className="font-medium">{author.name}</h2>
            {author.bio && <p className="text-sm mt-1">{author.bio}</p>}
          </div>
        ))}
      </div>
      {message}
    </div>
  );
};


