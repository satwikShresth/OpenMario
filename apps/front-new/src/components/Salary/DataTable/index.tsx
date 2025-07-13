import type { ReactNode } from 'react';
import { SalaryTableStoreProvider } from './Store.ts';
import type { Route } from '@/routes/home';
import Footer from './Footer.tsx';
import Body from './Body.tsx';
import Filters from './Filters.tsx';
import Pagination from './Pagination.tsx';

export const DataTable = {
   Root: (
      { Route, children }: {
         Route: Route;
         children?: ReactNode;
      },
   ) => (
      <SalaryTableStoreProvider initialValue={{ Route }}>
         {children}
      </SalaryTableStoreProvider>
   ),
   Filters,
   Body,
   Pagination,
   Footer,
};

export * from './Store';
