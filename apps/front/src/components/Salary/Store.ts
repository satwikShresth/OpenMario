import { create } from "zustand";
import { createZustandContext } from "zustand-context";
import type { Route } from "@/routes/home";

export type SalaryTableStore = {
  Route: Route;
};

export const [SalaryTableStoreProvider, useSalaryTableStore] =
  createZustandContext((initialState: { Route: Route }) =>
    create<SalaryTableStore>((_set, _get) => ({ ...initialState })),
  );
