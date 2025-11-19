import { Pagination } from './Pagination';
import { Card, Cards } from './Card';
import { FavoritesProvider } from '../Store.tsx';
import { Index } from 'react-instantsearch';
import type { ReactNode } from 'react';
import { Filters } from './Filters';
import Req from './Req.tsx';
import Availabilites from './Availabilites.tsx';

type CoursesProps = { index: string; children?: ReactNode };
export default {
   Root: ({ index, children }: CoursesProps) => (
      <Index indexName={index}>
         <FavoritesProvider initialValue={{ index }}>
            {children}
         </FavoritesProvider>
      </Index>
   ),
   Availabilites,
   Req,
   Pagination,
   Filters,
   Cards,
   Card,
};
