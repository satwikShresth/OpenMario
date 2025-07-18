import type { ReactNode } from 'react';
import { SalaryFormStoreProvider } from './Store.ts';

export const Form = {
   Root: (
      { children }: { children?: ReactNode },
   ) => (
      <SalaryFormStoreProvider initialValue={{}}>
         {children}
      </SalaryFormStoreProvider>
   ),
};

export * from './Store';
