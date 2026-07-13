import type { ReactNode } from 'react';
import DataTable from './DataTable';
import AutoFill from './AutoFill';
import { Form } from './Form';
import { ReportSalaryMenu } from './Menu';
import { ImportSalaryDialog } from './ImportSalaryDialog';

export const Salary = {
   Root: ({ children }: { children?: ReactNode }) => <>{children}</>,
   DataTable,
   Form,
   ReportSalaryMenu,
   AutoFill,
   ImportSalaryDialog,
};

export * from './Form';
export * from './AutoFill';
