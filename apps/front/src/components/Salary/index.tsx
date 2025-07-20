import type { ReactNode } from 'react';
import { SalaryStoreProvider } from './Store.ts';
import DataTable from './DataTable';
import AutoFill from './AutoFill';
import { Form } from './Form';
import { ReportSalaryMenu } from './Menu';

export const Salary = {
   Root: (
      { children }: {
         children?: ReactNode;
      },
   ) => (
      <SalaryStoreProvider initialValue={{}}>
         {children}
      </SalaryStoreProvider>
   ),
   DataTable,
   Form,
   ReportSalaryMenu,
   AutoFill,
};

export * from './Store';
export * from './Form';
export * from './AutoFill';
