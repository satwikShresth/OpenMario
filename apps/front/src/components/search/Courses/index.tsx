import { Pagination } from './Pagination';
import { Card, Cards } from './Card';
import { FavoritesProvider } from '../Store.tsx';
import { Index } from 'react-instantsearch';
import type { ReactNode } from 'react';

type CoursesProps = { index: string; children?: ReactNode };
export default {
   Root: ({ index, children }: CoursesProps) => (
      <Index indexName={index}>
         <FavoritesProvider initialValue={{ index }}>
            {children}
         </FavoritesProvider>
      </Index>
   ),
   Pagination,
   Cards,
   Card,
};
