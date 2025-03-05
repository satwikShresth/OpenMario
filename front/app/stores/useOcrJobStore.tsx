// stores/useOcrJobStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Job } from '#/hooks/useJobParser';
import { useEffect, useState } from 'react';

type OcrJobStore = {
  jobs: Job[];
  isProcessing: boolean;
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  clearJobs: () => void;
  setProcessing: (isProcessing: boolean) => void;
};

export const useOcrJobStore = create<OcrJobStore>()(
  persist(
    (set) => ({
      jobs: [],
      isProcessing: false,
      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
      clearJobs: () => set({ jobs: [] }),
      setProcessing: (isProcessing) => set({ isProcessing })
    }),
    {
      name: 'ocr-jobs-storage',
      storage: createJSONStorage(() => sessionStorage), // Using sessionStorage as OCR jobs are temporary
      partialize: (state) => ({ jobs: state.jobs }),
      version: 1,
      migrate: (persistedState: any) => {
        return persistedState as OcrJobStore;
      },
    }
  )
);

export const useOcrHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useOcrJobStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    setHasHydrated(useOcrJobStore.persist.hasHydrated());

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hasHydrated;
};
