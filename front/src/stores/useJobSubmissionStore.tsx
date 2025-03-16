import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandContext } from 'zustand-context';
import type { Submission, CompanyPosition } from '#/types';

type JobSubmissionStore = {
  submissions: Submission[];
  draftSubmissions: Submission[];
  companyPositions: CompanyPosition[];
  processing: boolean;

  // Original actions
  addSubmission: (submission: Submission) => void;
  updateSubmission: (index: number, submission: Submission) => void;
  removeSubmission: (index: number) => void;
  addDraftSubmission: (submission: Submission) => void;
  updateDraftSubmission: (index: number, submission: Submission) => void;
  removeDraftSubmission: (index: number) => void;
  moveDraftToSubmission: (draftIndex: number, id: string, data: any) => void;
  clearDraftSubmissions: () => void;
  setProcessing: (isProcessing: boolean) => void;

  // New sync helpers
  replaceAllSubmissions: (submissions: Submission[]) => void;
};

type InitialState = {
  initialSubmissions?: Submission[];
  initialDraftSubmissions?: Submission[];
  initialcompanyPositions?: CompanyPosition[];
  initialProcessing?: boolean;
};

export const [JobSubmissionProvider, useJobSubmissionStore] = createZustandContext(
  (initialState: InitialState = {}) =>
    create<JobSubmissionStore>()(
      persist(
        (set) => ({
          submissions: initialState.initialSubmissions || [],
          draftSubmissions: initialState.initialDraftSubmissions || [],
          companyPositions: initialState.initialcompanyPositions || [],
          processing: initialState.initialProcessing || false,

          addSubmission: (submission) =>
            set((state) => ({ submissions: [...state.submissions, submission] })),

          updateSubmission: (index, submission) =>
            set((state) => ({
              submissions: state.submissions.map((item, i) =>
                i === index ? submission : item
              )
            })),

          removeSubmission: (index) =>
            set((state) => ({
              submissions: state.submissions.filter((_, i) => i !== index)
            })),

          addDraftSubmission: (submission) =>
            set((state) => ({ draftSubmissions: [...state.draftSubmissions, submission] })),

          updateDraftSubmission: (index, submission) =>
            set((state) => ({
              draftSubmissions: state.draftSubmissions.map((item, i) =>
                i === index ? submission : item
              )
            })),

          removeDraftSubmission: (index) =>
            set((state) => ({
              draftSubmissions: state.draftSubmissions.filter((_, i) => i !== index)
            })),

          clearDraftSubmissions: () =>
            set(() => ({ draftSubmissions: [] })),

          setProcessing: (isProcessing) =>
            set(() => ({ processing: isProcessing })),

          // Move from draft to complete submission
          moveDraftToSubmission: (draftIndex, id, data) =>
            set((state) => {
              const draftToMove = state.draftSubmissions[draftIndex];
              if (!draftToMove) return state;

              return {
                submissions: [...state.submissions, { ...data, id }],
                draftSubmissions: state.draftSubmissions.filter((_, i) => i !== draftIndex)
              };
            }),

          replaceAllSubmissions: (submissions) =>
            set(() => ({ submissions })),
        }),
        {
          name: 'job-submissions-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            submissions: state.submissions,
            draftSubmissions: state.draftSubmissions,
            processing: state.processing
          }),
          version: 1,
          migrate: (persistedState: any) => {
            return persistedState as JobSubmissionStore;
          },
        }
      )
    ),
);
