import type { ReactNode } from 'react';
import { FavoritesProvider } from './Store';
import Courses from './Courses';

type SalaryProps = { index: string; children?: ReactNode };
export const Search = {
   Root: ({ index, children }: SalaryProps) => (
      <FavoritesProvider initialValue={{ index }}>{children}</FavoritesProvider>
   ),
   Courses,
};

export * from './Store';
export * from './refinements';
export * from './Stats';
