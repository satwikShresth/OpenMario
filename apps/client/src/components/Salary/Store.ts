import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createZustandContext } from 'zustand-context';
import type { SubmissionAggregate as SubmissionBase } from '@/client';

export type CompanyPosition = {
   company: string;
   position: string;
   company_id: string;
   position_id: string;
};

type Submission = SubmissionBase & { owner_id?: string; id?: string };

export type SalaryStore = {
   submissions: Map<string, Submission>;
   draftSubmissions: Submission[];
   companyPositions: CompanyPosition[];
   processing: boolean;

   actions: {
      addSubmission: (id: string, submission: Submission) => void;
      updateSubmission: (id: string, submission: Submission) => void;
      removeSubmission: (id: string) => void;
      addDraftSubmission: (submission: Submission) => void;
      updateDraftSubmission: (index: number, submission: Submission) => void;
      removeDraftSubmission: (index: number) => void;
      moveDraftToSubmission: (
         draftIndex: number,
         id: string,
         data: Submission,
      ) => void;
      clearDraftSubmissions: () => void;
      setProcessing: (isProcessing: boolean) => void;
      replaceAllSubmissions: (submissions: Array<Submission>) => void;
   };
};

export const [SalaryStoreProvider, useSalaryStore] = createZustandContext(() =>
   create<SalaryStore>()(
      persist(
         immer((set) => ({
            submissions: new Map<string, Submission>(),
            draftSubmissions: [],
            companyPositions: [],
            processing: false,

            actions: {
               addSubmission: (id, submission) =>
                  set((state) => {
                     state.submissions.set(id, submission);
                  }),

               updateSubmission: (id, submission) =>
                  set((state) => {
                     if (
                        state.submissions.has(id) &&
                        state.submissions.get(id) !== submission
                     ) {
                        state.submissions.set(id, submission);
                     }
                  }),

               removeSubmission: (id) =>
                  set((state) => {
                     state.submissions.delete(id);
                  }),

               addDraftSubmission: (submission) =>
                  set((state) => {
                     state.draftSubmissions.push(submission);
                  }),

               updateDraftSubmission: (index, submission) =>
                  set((state) => {
                     if (state.draftSubmissions[index]) {
                        state.draftSubmissions[index] = submission;
                     }
                  }),

               removeDraftSubmission: (index) =>
                  set((state) => {
                     state.draftSubmissions.splice(index, 1);
                  }),

               clearDraftSubmissions: () =>
                  set((state) => {
                     state.draftSubmissions.length = 0;
                  }),

               setProcessing: (isProcessing) =>
                  set((state) => {
                     state.processing = isProcessing;
                  }),

               moveDraftToSubmission: (draftIndex, id, data) =>
                  set((state) => {
                     const draftToMove = state.draftSubmissions[draftIndex];
                     if (draftToMove) {
                        state.submissions.set(id, data);
                        state.draftSubmissions.splice(draftIndex, 1);
                     }
                  }),

               replaceAllSubmissions: (submissions) =>
                  set((state) => {
                     submissions.forEach((submission) => {
                        if (submission?.id) {
                           state.submissions.set(submission.id, submission);
                        }
                     });
                  }),
            },
         })),
         {
            name: 'job-submissions-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
               submissions: Object.fromEntries(state.submissions),
               draftSubmissions: state.draftSubmissions,
               processing: state.processing,
            }),
            onRehydrateStorage: () => (state) => {
               if (state?.submissions) {
                  state.submissions = new Map(Object.entries(state.submissions));
               }
            },
            version: 0,
         },
      ),
   )
);
