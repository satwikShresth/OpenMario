import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Submission } from '#client/types.gen';
import { useEffect, useState } from 'react';

type JobSubmissionStore = {
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
  updateSubmission: (index: number, submission: Submission) => void;
  removeSubmission: (index: number) => void;
};

export const useJobSubmissionStore = create<JobSubmissionStore>()(
  persist(
    (set) => ({
      submissions: [],
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
        }))
    }),
    {
      name: 'job-submissions-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ submissions: state.submissions }),
      version: 1,
      migrate: (persistedState: any) => {
        return persistedState as JobSubmissionStore;
      },
    }
  )
);


export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useJobSubmissionStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    setHasHydrated(useJobSubmissionStore.persist.hasHydrated());

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hasHydrated;
}; 
