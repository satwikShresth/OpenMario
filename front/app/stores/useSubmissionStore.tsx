import { create } from 'zustand';
import { createZustandContext } from 'zustand-context';

type SubmissionsStore = {
  skip: number;
  limit: number;
  setSkip: (skip: number) => void;
  setLimit: (limit: number) => void;
  gotoFirstPage: () => void;
  gotoPreviousPage: (skip: number, limit: number) => void;
  gotoNextPage: (skip: number, limit: number) => void;
  gotoLastPage: (totalCount: number, limit: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const [SubmissionsProvider, useSubmissionsStore] = createZustandContext(
  (initialState: {
    initialSkip?: number,
    initialLimit?: number
  } = {}) =>
    create<SubmissionsStore>((set) => ({
      skip: 0,
      limit: 10,
      setSkip: (skip) => set(() => ({ skip })),
      setLimit: (limit) => set(() => ({ limit })),
      gotoFirstPage: () => set(() => ({ skip: 0 })),
      gotoPreviousPage: (skip, limit) => {
        set(() => ({ skip: Math.max(0, skip - limit) }));
      },
      gotoNextPage: (skip, limit) => {
        set(() => ({ skip: skip + limit }));
      },
      gotoLastPage: (totalCount, limit) => {
        const lastPageSkip = Math.max(0, Math.floor((totalCount - 1) / limit) * limit);
        set(() => ({ skip: lastPageSkip }));
      },
      handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLSelectElement>) => {
        set(() => ({ skip: 0, limit: parseInt(event.target.value, 10) }));
      }
    }))
);
