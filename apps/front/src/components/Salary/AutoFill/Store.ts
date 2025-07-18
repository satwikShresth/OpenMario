import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createZustandContext } from "zustand-context";
import type { SalaryRoute } from "@/routes/salary";
import type { SubmissionAggregate as SubmissionBase } from "@/client";

export type CompanyPosition = {
  company: string;
  position: string;
  company_id: string;
  position_id: string;
};

type Submission = SubmissionBase & { id?: string };
type InitialSalaryStore = { Route: SalaryRoute };
export type SalaryStore = {
  Route: SalaryRoute;
  submissions: Map<string, Submission>;
  draftSubmissions: Submission[];
  companyPositions: CompanyPosition[];
  processing: boolean;

  // Original actions
  addSubmission: (id: string, submission: Submission) => void;
  updateSubmission: (id: string, submission: Submission) => void;
  removeSubmission: (id: string) => void;
  addDraftSubmission: (submission: Submission) => number;
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
export const [SalaryStoreProvider, useSalaryStore] = createZustandContext(
  (initialState: InitialSalaryStore) =>
    create<SalaryStore>()(
      persist(
        (set) => ({
          Route: initialState.Route,
          submissions: new Map<string, Submission>(),
          draftSubmissions: [],
          companyPositions: [],
          processing: false,

          addSubmission: (id, submission) =>
            set((state) => ({
              submissions: new Map([...state.submissions, [id, submission]]),
            })),

          updateSubmission: (id, submission) =>
            set((state) => {
              if (
                !state.submissions.has(id) ||
                state.submissions.get(id) === submission
              ) {
                return state;
              }
              return {
                submissions: new Map([...state.submissions, [id, submission]]),
              };
            }),

          removeSubmission: (id) =>
            set((state) => {
              // Skip if id doesn't exist
              if (!state.submissions.has(id)) {
                return state;
              }
              const newSubmissions = new Map(state.submissions);
              newSubmissions.delete(id);
              return { submissions: newSubmissions };
            }),

          addDraftSubmission: (submission) =>
            set((state) => ({
              draftSubmissions: [...state.draftSubmissions, submission],
            })),

          updateDraftSubmission: (index, submission) =>
            set((state) => ({
              draftSubmissions: state?.draftSubmissions?.map((item, i) =>
                i === index ? submission : item,
              ),
            })),

          removeDraftSubmission: (index) =>
            set((state) => ({
              draftSubmissions: state.draftSubmissions.filter(
                (_, i) => i !== index,
              ),
            })),

          clearDraftSubmissions: () => set(() => ({ draftSubmissions: [] })),

          setProcessing: (isProcessing) =>
            set(() => ({ processing: isProcessing })),

          moveDraftToSubmission: (draftIndex, id, data) =>
            set((state) => {
              const draftToMove = state.draftSubmissions[draftIndex];
              if (!draftToMove) return state;

              return {
                submissions: new Map([...state.submissions, [id, { ...data }]]),
                draftSubmissions: state.draftSubmissions.filter(
                  (_, i) => i !== draftIndex,
                ),
              };
            }),

          replaceAllSubmissions: (submissions) =>
            set((state) => {
              const newSubmissions = new Map(state.submissions);

              submissions.forEach((submission) => {
                if (submission && submission.id) {
                  newSubmissions.set(submission.id, submission);
                }
              });

              return { submissions: newSubmissions };
            }),
        }),
        {
          name: "job-submissions-storage",
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            submissions: Object.fromEntries(state.submissions),
            draftSubmissions: state.draftSubmissions,
            processing: state.processing,
          }),
          onRehydrateStorage: () => (state) => {
            if (state && state.submissions) {
              state.submissions = new Map(Object.entries(state.submissions));
            }
          },
          version: 0,
        },
      ),
    ),
);
