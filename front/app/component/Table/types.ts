import type { Submission } from "#client/types.gen";
import type { PaginationState, SortingState } from '@tanstack/react-table';

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

