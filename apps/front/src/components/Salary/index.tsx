import type { ReactNode } from 'react';
import { type SalaryStore, SalaryStoreProvider } from './Store.ts';
import DataTable from './DataTable';
import { ReportSalaryMenu } from './Menu';

export const Salary = {
   Root: (
      { Route, children }: {
         Route: SalaryStore['Route'];
         children?: ReactNode;
      },
   ) => (
      <SalaryStoreProvider initialValue={{ Route }}>
         {children}
      </SalaryStoreProvider>
   ),
   DataTable,
   ReportSalaryMenu,
};

export * from './Store';
