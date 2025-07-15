import { create } from 'zustand';
import { createZustandContext } from 'zustand-context';
import { routeTree } from '@/routeTree.gen.ts';

const RouteType = routeTree?.children?.SalaryRoute?.children?.SalaryIndexRoute!;
export type Route = typeof RouteType;

export type SalaryTableStore = {
   Route: Route;
};

export const [SalaryTableStoreProvider, useSalaryTableStore] = createZustandContext((
   initialState: { Route: Route },
) => create<SalaryTableStore>((_set, _get) => ({ ...initialState })));
