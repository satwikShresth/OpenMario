import type { Submission } from "#/types";
import type { PaginationState, SortingState } from "@tanstack/react-table";

export interface SubmissionsTableProps {
  submissions: Submission[];
  totalCount: number;
  pagination: PaginationState;
  setPagination: (pagination: PaginationState) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  isLoading: boolean;
  isError: boolean;
}

export const TableConfig = [
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "compensation",
    header: "Wage",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return `$${value.toLocaleString()}`;
    },
  },
  {
    accessorFn: (row) => `${row.location_city}, ${row.location_state_code}`,
    id: "location",
    header: "Location",
  },
  {
    accessorKey: "program_level",
    header: "Program",
    size: 120,
  },
  {
    accessorKey: "work_hours",
    header: "Hours",
    size: 100,
  },
  {
    accessorKey: "year",
    header: "Year",
    size: 80,
  },
  {
    accessorKey: "coop_year",
    header: "Co-op Year",
    size: 135,
  },
  {
    accessorKey: "coop_cycle",
    header: "Cycle",
  },
];
