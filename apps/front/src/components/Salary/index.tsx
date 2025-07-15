import type { ReactNode } from 'react';
import { type Route, SalaryTableStoreProvider } from './Store.ts';
import DataTable from './DataTable';
import Menu from './Menu';

export const Salary = {
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
   DataTable,
   Menu,
};

export * from './Store';
