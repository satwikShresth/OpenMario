import type { ReactNode } from 'react';
import DataTable from './DataTable';
import AutoFill from './AutoFill';
import { Form } from './Form';
import { ReportSalaryMenu } from './Menu';

export const Salary = {
   Root: ({ children }: { children?: ReactNode }) => <>{children}</>,
   DataTable,
   Form,
   ReportSalaryMenu,
   AutoFill,
};

export * from './Form';
export * from './AutoFill';
