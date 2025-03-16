import type { COOP_CYCLES, COOP_YEARS, PROGRAM_LEVELS } from '#/types';
import { create } from 'zustand/react';

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

  // Query parameter methods
  setCompany: (company: string[] | undefined) => void;
  setPosition: (position: string[] | undefined) => void;
  setLocation: (location: string[] | undefined) => void;
  setYear: (year: number[] | undefined) => void;
  setCoopYear: (coop_year: typeof COOP_YEARS[number][] | undefined) => void;
  setCoopCycle: (coop_cycle: typeof COOP_CYCLES[number][] | undefined) => void;
  setProgramLevel: (program_level: typeof PROGRAM_LEVELS[number] | undefined) => void;
  setDistinct: (distinct: boolean) => void;
  setSearch: ({
    company,
    position,
    location,
    year,
    coop_year,
    coop_cycle,
    program_level,
    distinct,
  }: {
    company?: string[];
    position?: string[];
    location?: string[];
    year?: number[];
    coop_year?: typeof COOP_YEARS[number][] | undefined;
    coop_cycle?: typeof COOP_CYCLES[number][] | undefined;
    program_level?: typeof PROGRAM_LEVELS[number] | undefined;
    distinct?: boolean;
  }) => void;

  // Reset all filters
  resetFilters: () => void;

  // Clear everything including querystring
  clearAll: () => void;
};

export const useFilterStore = create<SubmissionsStore>(
  (set) => (
    {
      pageIndex: 0,
      pageSize: 10,
      company: undefined,
      position: undefined,
      location: undefined,
      year: undefined,
      coop_cycle: undefined,
      coop_year: undefined,
      program_level: "Undergraduate",
      distinct: true,

      setPagination: (updater) => {
        if (typeof updater === 'function') {
          set((state) => updater(state));
        } else {
          set(updater);
        }
      },

      setCompany: (company) => set(() => ({ company, skip: 0 })),
      setPosition: (position) => set(() => ({ position, skip: 0 })),
      setLocation: (location) => set(() => ({ location, skip: 0 })),
      setYear: (year) => set(() => ({ year, skip: 0 })),
      setCoopYear: (coop_year) => set(() => ({ coop_year, skip: 0 })),
      setCoopCycle: (coop_cycle) => set(() => ({ coop_cycle, skip: 0 })),
      setProgramLevel: (program_level) => set(() => ({ program_level, skip: 0 })),
      setDistinct: (distinct) => set(() => ({ distinct, skip: 0 })),
      setSearch: (search) => set(() => {
        return {
          company: search?.company,
          position: search?.position,
          location: search?.location,
          year: search?.year,
          coop_year: search?.coop_year,
          coop_cycle: search?.coop_cycle,
          program_level: search?.program_level,
          distinct: search?.distinct || true,
          pageSize: search?.pageSize || 10,
          pageIndex: search?.pageIndex || 0,
        }
      }),
      resetFilters: () => set((state) => ({
        company: undefined,
        position: undefined,
        location: undefined,
        year: undefined,
        coop_year: undefined,
        coop_cycle: undefined,
        program_level: undefined,
        distinct: true,
        pageSize: state.pageSize,
        pageIndex: state.pageIndex,
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
          distinct: true,
          pageSize: state.pageSize,
          pageIndex: state.pageIndex,
        }));
      }

    }
  ))
