import type { COOP_CYCLES, COOP_YEARS, PROGRAM_LEVELS } from '#/types';
import type { Filter } from '#/utils/validators';
import { create } from 'zustand';
import { createZustandContext } from 'zustand-context';
import { devtools } from 'zustand/middleware'

type SubmissionsStore = {
  // Pagination
  pageIndex: number;
  pageSize: number;
  //pageCount: number;

  // Query parameters
  company: string[] | undefined;
  position: string[] | undefined;
  location: string[] | undefined;
  year: number[] | undefined;
  coop_year: typeof COOP_YEARS[number][] | undefined;
  coop_cycle: typeof COOP_CYCLES[number][] | undefined;
  program_level: typeof PROGRAM_LEVELS[number] | undefined;
  distinct: boolean;

  // Pagination methods
  setPagination: ({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) => void;

  setPageCount: (company: number) => void;
  // Query parameter methods
  setCompany: (company: string[] | undefined) => void;
  setPosition: (position: string[] | undefined) => void;
  setLocation: (location: string[] | undefined) => void;
  setYear: (year: number[] | undefined) => void;
  setCoopYear: (coop_year: typeof COOP_YEARS[number][] | undefined) => void;
  setCoopCycle: (coop_cycle: typeof COOP_CYCLES[number][] | undefined) => void;
  setProgramLevel: (program_level: typeof PROGRAM_LEVELS[number] | undefined) => void;
  setDistinct: (distinct: boolean) => void;

  // Reset all filters
  resetFilters: () => void;

  // Clear everything including querystring
  clearAll: () => void;
};

export const [FilterProvider, useFilterStore] = createZustandContext(
  ({ pageIndex = 0, pageSize = 10, pageCount, company, position, location, year, coop_cycle, coop_year, program_level, distinct = false }: Filter = {}) => {

    return create<SubmissionsStore>()(
      devtools(
        (set) => (
          {
            pageIndex,
            pageSize,
            //pageCount,
            company,
            position,
            location,
            year,
            coop_year,
            coop_cycle,
            program_level,
            distinct,

            setPagination: (updater) => {
              if (typeof updater === 'function') {
                set((state) => updater(state));
              } else {
                set(updater);
              }
            },
            //setPageCount: (pageCount) => set(() => ({ pageCount })),
            setCompany: (company) => set(() => ({ company, skip: 0 })),
            setPosition: (position) => set(() => ({ position, skip: 0 })),
            setLocation: (location) => set(() => ({ location, skip: 0 })),
            setYear: (year) => set(() => ({ year, skip: 0 })),
            setCoopYear: (coop_year) => set(() => ({ coop_year, skip: 0 })),
            setCoopCycle: (coop_cycle) => set(() => ({ coop_cycle, skip: 0 })),
            setProgramLevel: (program_level) => set(() => ({ program_level, skip: 0 })),
            setDistinct: (distinct) => set(() => ({ distinct, skip: 0 })),

            resetFilters: () => set((state) => ({
              company: undefined,
              position: undefined,
              location: undefined,
              year: undefined,
              coop_year: undefined,
              coop_cycle: undefined,
              program_level: undefined,
              distinct: false,
              pageSize: 10,
              pageIndex: 0,
            })),

            clearAll: () => {
              set((state) => ({
                company: undefined,
                position: undefined,
                location: undefined,
                year: undefined,
                coop_year: undefined,
                coop_cycle: undefined,
                program_level: undefined,
                distinct: false,
                pageSize,
                pageIndex,
              }));
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.search = '';
                window.history.replaceState({}, '', url.toString());
              }

              if (typeof window !== 'undefined') {
                localStorage.removeItem('submissions-storage');
              }
            }

          }
        )
      ),
    )
  }
);
