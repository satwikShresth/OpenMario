import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { submissions, companyPositions } from '@/db/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { SubmissionAggregate as SubmissionBase } from '@openmario/server/contracts';

// Types matching the original Zustand store
export type CompanyPosition = {
   company: string;
   position: string;
   company_id: string;
   position_id: string;
};

type Submission = SubmissionBase & { owner_id?: string; id?: string };

// Query key factory
const salaryKeys = {
   all: ['salary'] as const,
   submissions: () => [...salaryKeys.all, 'submissions'] as const,
   drafts: () => [...salaryKeys.all, 'drafts'] as const,
   companyPositions: () => [...salaryKeys.all, 'company-positions'] as const
};

// Prepared statements for common queries
const prepared = {
   getAllSubmissions: db
      .select()
      .from(submissions)
      .where(eq(submissions.isDraft, false))
      .prepare('salary_get_all_submissions'),

   getAllDrafts: db
      .select()
      .from(submissions)
      .where(eq(submissions.isDraft, true))
      .prepare('salary_get_all_drafts'),

   getAllCompanyPositions: db
      .select()
      .from(companyPositions)
      .prepare('salary_get_company_positions'),

   removeSubmission: db
      .delete(submissions)
      .where(eq(submissions.serverId, sql.placeholder('id')))
      .prepare('salary_remove_submission'),

   removeDraft: db
      .delete(submissions)
      .where(
         and(
            eq(submissions.id, sql.placeholder('id')),
            eq(submissions.isDraft, true)
         )
      )
      .prepare('salary_remove_draft'),

   clearAllDrafts: db
      .delete(submissions)
      .where(eq(submissions.isDraft, true))
      .prepare('salary_clear_drafts'),

   clearAllSubmissions: db
      .delete(submissions)
      .where(eq(submissions.isDraft, false))
      .prepare('salary_clear_submissions')
};

// Database operations
const salaryDb = {
   // Submissions (synced, non-draft)
   getAllSubmissions: async () => {
      const result = await prepared.getAllSubmissions.execute();
      return result.map(sub => ({
         id: sub.serverId || sub.id,
         owner_id: sub.ownerId || undefined,
         company: String(sub.company),
         position: String(sub.position),
         location: String(sub.location),
         work_hours: Number(sub.workHours),
         compensation: Number(sub.compensation),
         other_compensation: String(sub.otherCompensation || ''),
         details: String(sub.details || ''),
         year: Number(sub.year),
         coop_year: String(sub.coopYear) as any,
         coop_cycle: String(sub.coopCycle) as any,
         program_level: String(sub.programLevel) as any
      })) as Submission[];
   },

   addSubmission: async (id: string, submission: Submission) => {
      await db.insert(submissions).values({
         serverId: id,
         ownerId: submission.owner_id,
         status: 'synced',
         isDraft: false,
         company: submission.company,
         companyId: submission.company || '',
         position: submission.position,
         positionId: submission.position || '',
         location: submission.location,
         year: submission.year,
         coopYear: submission.coop_year,
         coopCycle: submission.coop_cycle,
         programLevel: submission.program_level,
         workHours: submission.work_hours,
         compensation: submission.compensation,
         otherCompensation: submission.other_compensation,
         details: submission.details,
         syncedAt: new Date()
      });
   },

   updateSubmission: async (id: string, submission: Submission) => {
      await db
         .update(submissions)
         .set({
            ownerId: submission.owner_id,
            company: submission.company,
            position: submission.position,
            location: submission.location,
            year: submission.year,
            coopYear: submission.coop_year,
            coopCycle: submission.coop_cycle,
            programLevel: submission.program_level,
            workHours: submission.work_hours,
            compensation: submission.compensation,
            otherCompensation: submission.other_compensation,
            details: submission.details,
            updatedAt: new Date()
         })
         .where(eq(submissions.serverId, id));
   },

   removeSubmission: async (id: string) => {
      await prepared.removeSubmission.execute({ id });
   },

   replaceAllSubmissions: async (subs: Submission[]) => {
      // Delete all non-draft submissions
      await prepared.clearAllSubmissions.execute();

      // Insert new ones
      if (subs.length > 0) {
         await db.insert(submissions).values(
            subs.map(sub => ({
               serverId: sub.id || undefined,
               ownerId: sub.owner_id,
               status: 'synced' as const,
               isDraft: false,
               company: sub.company,
               companyId: sub.company || '',
               position: sub.position,
               positionId: sub.position || '',
               location: sub.location,
               year: sub.year,
               coopYear: sub.coop_year,
               coopCycle: sub.coop_cycle,
               programLevel: sub.program_level,
               workHours: sub.work_hours,
               compensation: sub.compensation,
               otherCompensation: sub.other_compensation,
               details: sub.details,
               syncedAt: new Date()
            }))
         );
      }
   },

   // Draft submissions
   getAllDrafts: async () => {
      const result = await prepared.getAllDrafts.execute();
      return result.map(sub => ({
         id: sub.id,
         owner_id: sub.ownerId || undefined,
         company: String(sub.company),
         position: String(sub.position),
         location: String(sub.location),
         work_hours: Number(sub.workHours),
         compensation: Number(sub.compensation),
         other_compensation: String(sub.otherCompensation || ''),
         details: String(sub.details || ''),
         year: Number(sub.year),
         coop_year: String(sub.coopYear) as any,
         coop_cycle: String(sub.coopCycle) as any,
         program_level: String(sub.programLevel) as any
      })) as Submission[];
   },

   addDraft: async (submission: Submission) => {
      const result = await db
         .insert(submissions)
         .values({
            status: 'draft',
            isDraft: true,
            company: submission.company,
            companyId: submission.company || '',
            position: submission.position,
            positionId: submission.position || '',
            location: submission.location,
            year: submission.year,
            coopYear: submission.coop_year,
            coopCycle: submission.coop_cycle,
            programLevel: submission.program_level,
            workHours: submission.work_hours,
            compensation: submission.compensation,
            otherCompensation: submission.other_compensation,
            details: submission.details
         })
         .returning();
      return result[0];
   },

   updateDraft: async (id: string, submission: Submission) => {
      await db
         .update(submissions)
         .set({
            company: submission.company,
            position: submission.position,
            location: submission.location,
            year: submission.year,
            coopYear: submission.coop_year,
            coopCycle: submission.coop_cycle,
            programLevel: submission.program_level,
            workHours: submission.work_hours,
            compensation: submission.compensation,
            otherCompensation: submission.other_compensation,
            details: submission.details,
            updatedAt: new Date()
         })
         .where(and(eq(submissions.id, id), eq(submissions.isDraft, true)));
   },

   removeDraft: async (id: string) => {
      await prepared.removeDraft.execute({ id });
   },

   clearAllDrafts: async () => {
      await prepared.clearAllDrafts.execute();
   },

   moveDraftToSubmission: async (draftId: string, serverId: string, data: Submission) => {
      // Update the draft to become a synced submission
      await db
         .update(submissions)
         .set({
            serverId,
            ownerId: data.owner_id,
            status: 'synced',
            isDraft: false,
            company: data.company,
            position: data.position,
            location: data.location,
            year: data.year,
            coopYear: data.coop_year,
            coopCycle: data.coop_cycle,
            programLevel: data.program_level,
            workHours: data.work_hours,
            compensation: data.compensation,
            otherCompensation: data.other_compensation,
            details: data.details,
            syncedAt: new Date(),
            updatedAt: new Date()
         })
         .where(eq(submissions.id, draftId));
   },

   // Company positions
   getAllCompanyPositions: async () => {
      const result = await prepared.getAllCompanyPositions.execute();
      return result.map(cp => ({
         company: String(cp.company),
         position: String(cp.position),
         company_id: String(cp.companyId),
         position_id: String(cp.positionId)
      })) as CompanyPosition[];
   }
};

export type SalaryStore = {
   submissions: Map<string, Submission>;
   draftSubmissions: Submission[];
   companyPositions: CompanyPosition[];
   processing: boolean;
   isLoading: boolean;

   actions: {
      addSubmission: (id: string, submission: Submission) => Promise<void>;
      updateSubmission: (id: string, submission: Submission) => Promise<void>;
      removeSubmission: (id: string) => Promise<void>;
      addDraftSubmission: (submission: Submission) => Promise<void>;
      updateDraftSubmission: (index: number, submission: Submission) => Promise<void>;
      removeDraftSubmission: (index: number) => Promise<void>;
      moveDraftToSubmission: (
         draftIndex: number,
         id: string,
         data: Submission
      ) => Promise<void>;
      clearDraftSubmissions: () => Promise<void>;
      setProcessing: (isProcessing: boolean) => void;
      replaceAllSubmissions: (submissions: Array<Submission>) => Promise<void>;
   };
};

export function useSalaryStore(): SalaryStore {
   const queryClient = useQueryClient();

   // Query for all submissions
   // No caching needed - IndexedDB is our persistent cache
   const { data: submissionsList = [], isLoading: isLoadingSubmissions } = useQuery({
      queryKey: salaryKeys.submissions(),
      queryFn: salaryDb.getAllSubmissions,
      gcTime: 0, // Don't keep in memory after component unmounts
      staleTime: 0 // Always fresh from IndexedDB
   });

   // Query for draft submissions
   // No caching needed - IndexedDB is our persistent cache
   const { data: draftsList = [], isLoading: isLoadingDrafts } = useQuery({
      queryKey: salaryKeys.drafts(),
      queryFn: salaryDb.getAllDrafts,
      gcTime: 0, // Don't keep in memory after component unmounts
      staleTime: 0 // Always fresh from IndexedDB
   });

   // Query for company positions
   // No caching needed - IndexedDB is our persistent cache
   const { data: companyPositionsList = [], isLoading: isLoadingPositions } = useQuery({
      queryKey: salaryKeys.companyPositions(),
      queryFn: salaryDb.getAllCompanyPositions,
      gcTime: 0, // Don't keep in memory after component unmounts
      staleTime: 0 // Always fresh from IndexedDB
   });

   // Convert submissions list to Map
   const submissionsMap = useMemo(() => {
      const map = new Map<string, Submission>();
      for (const sub of submissionsList) {
         if (sub.id) {
            map.set(sub.id, sub);
         }
      }
      return map;
   }, [submissionsList]);

   // Processing state (in-memory only)
   const [processing, setProcessing] = useState(false);

   // Add submission mutation
   const addSubmissionMutation = useMutation({
      mutationFn: ({ id, submission }: { id: string; submission: Submission }) =>
         salaryDb.addSubmission(id, submission),
      onMutate: async ({ id, submission }) => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.submissions() });

         const previousSubmissions = queryClient.getQueryData<Submission[]>(
            salaryKeys.submissions()
         );

         queryClient.setQueryData<Submission[]>(salaryKeys.submissions(), old => [
            ...(old || []),
            { ...submission, id }
         ]);

         return { previousSubmissions };
      },
      onError: (_err, _vars, context) => {
         if (context?.previousSubmissions) {
            queryClient.setQueryData(salaryKeys.submissions(), context.previousSubmissions);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.submissions() });
      }
   });

   // Update submission mutation
   const updateSubmissionMutation = useMutation({
      mutationFn: ({ id, submission }: { id: string; submission: Submission }) =>
         salaryDb.updateSubmission(id, submission),
      onMutate: async ({ id, submission }) => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.submissions() });

         const previousSubmissions = queryClient.getQueryData<Submission[]>(
            salaryKeys.submissions()
         );

         queryClient.setQueryData<Submission[]>(salaryKeys.submissions(), old =>
            (old || []).map(sub => (sub.id === id ? { ...sub, ...submission } : sub))
         );

         return { previousSubmissions };
      },
      onError: (_err, _vars, context) => {
         if (context?.previousSubmissions) {
            queryClient.setQueryData(salaryKeys.submissions(), context.previousSubmissions);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.submissions() });
      }
   });

   // Remove submission mutation
   const removeSubmissionMutation = useMutation({
      mutationFn: (id: string) => salaryDb.removeSubmission(id),
      onMutate: async id => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.submissions() });

         const previousSubmissions = queryClient.getQueryData<Submission[]>(
            salaryKeys.submissions()
         );

         queryClient.setQueryData<Submission[]>(salaryKeys.submissions(), old =>
            (old || []).filter(sub => sub.id !== id)
         );

         return { previousSubmissions };
      },
      onError: (_err, _id, context) => {
         if (context?.previousSubmissions) {
            queryClient.setQueryData(salaryKeys.submissions(), context.previousSubmissions);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.submissions() });
      }
   });

   // Replace all submissions mutation
   const replaceAllSubmissionsMutation = useMutation({
      mutationFn: (subs: Submission[]) => salaryDb.replaceAllSubmissions(subs),
      onMutate: async subs => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.submissions() });

         const previousSubmissions = queryClient.getQueryData<Submission[]>(
            salaryKeys.submissions()
         );

         queryClient.setQueryData<Submission[]>(salaryKeys.submissions(), subs);

         return { previousSubmissions };
      },
      onError: (_err, _subs, context) => {
         if (context?.previousSubmissions) {
            queryClient.setQueryData(salaryKeys.submissions(), context.previousSubmissions);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.submissions() });
      }
   });

   // Add draft mutation
   const addDraftMutation = useMutation({
      mutationFn: (submission: Submission) => salaryDb.addDraft(submission),
      onMutate: async submission => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.drafts() });

         const previousDrafts = queryClient.getQueryData<Submission[]>(salaryKeys.drafts());

         // Optimistically add with temporary ID
         queryClient.setQueryData<Submission[]>(salaryKeys.drafts(), old => [
            ...(old || []),
            { ...submission, id: `temp-${Date.now()}` }
         ]);

         return { previousDrafts };
      },
      onSuccess: (result, submission) => {
         // Replace temp with real ID
         queryClient.setQueryData<Submission[]>(salaryKeys.drafts(), old =>
            (old || []).map(d =>
               d.company === submission.company && d.position === submission.position
                  ? { ...d, id: result.id }
                  : d
            )
         );
      },
      onError: (_err, _submission, context) => {
         if (context?.previousDrafts) {
            queryClient.setQueryData(salaryKeys.drafts(), context.previousDrafts);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.drafts() });
      }
   });

   // Update draft mutation
   const updateDraftMutation = useMutation({
      mutationFn: ({ index, submission }: { index: number; submission: Submission }) => {
         const draft = draftsList[index];
         if (!draft?.id) throw new Error('Draft not found');
         return salaryDb.updateDraft(draft.id, submission);
      },
      onMutate: async ({ index, submission }) => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.drafts() });

         const previousDrafts = queryClient.getQueryData<Submission[]>(salaryKeys.drafts());

         queryClient.setQueryData<Submission[]>(salaryKeys.drafts(), old => {
            const updated = [...(old || [])];
            if (updated[index]) {
               updated[index] = { ...updated[index], ...submission };
            }
            return updated;
         });

         return { previousDrafts };
      },
      onError: (_err, _vars, context) => {
         if (context?.previousDrafts) {
            queryClient.setQueryData(salaryKeys.drafts(), context.previousDrafts);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.drafts() });
      }
   });

   // Remove draft mutation
   const removeDraftMutation = useMutation({
      mutationFn: (index: number) => {
         const draft = draftsList[index];
         if (!draft?.id) throw new Error('Draft not found');
         return salaryDb.removeDraft(draft.id);
      },
      onMutate: async index => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.drafts() });

         const previousDrafts = queryClient.getQueryData<Submission[]>(salaryKeys.drafts());

         queryClient.setQueryData<Submission[]>(salaryKeys.drafts(), old => {
            const updated = [...(old || [])];
            updated.splice(index, 1);
            return updated;
         });

         return { previousDrafts };
      },
      onError: (_err, _index, context) => {
         if (context?.previousDrafts) {
            queryClient.setQueryData(salaryKeys.drafts(), context.previousDrafts);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.drafts() });
      }
   });

   // Clear all drafts mutation
   const clearDraftsMutation = useMutation({
      mutationFn: salaryDb.clearAllDrafts,
      onMutate: async () => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.drafts() });

         const previousDrafts = queryClient.getQueryData<Submission[]>(salaryKeys.drafts());

         queryClient.setQueryData<Submission[]>(salaryKeys.drafts(), []);

         return { previousDrafts };
      },
      onError: (_err, _vars, context) => {
         if (context?.previousDrafts) {
            queryClient.setQueryData(salaryKeys.drafts(), context.previousDrafts);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.drafts() });
      }
   });

   // Move draft to submission mutation
   const moveDraftToSubmissionMutation = useMutation({
      mutationFn: ({
         draftIndex,
         id,
         data
      }: {
         draftIndex: number;
         id: string;
         data: Submission;
      }) => {
         const draft = draftsList[draftIndex];
         if (!draft?.id) throw new Error('Draft not found');
         return salaryDb.moveDraftToSubmission(draft.id, id, data);
      },
      onMutate: async ({ draftIndex, id, data }) => {
         await queryClient.cancelQueries({ queryKey: salaryKeys.drafts() });
         await queryClient.cancelQueries({ queryKey: salaryKeys.submissions() });

         const previousDrafts = queryClient.getQueryData<Submission[]>(salaryKeys.drafts());
         const previousSubmissions = queryClient.getQueryData<Submission[]>(
            salaryKeys.submissions()
         );

         // Remove from drafts
         queryClient.setQueryData<Submission[]>(salaryKeys.drafts(), old => {
            const updated = [...(old || [])];
            updated.splice(draftIndex, 1);
            return updated;
         });

         // Add to submissions
         queryClient.setQueryData<Submission[]>(salaryKeys.submissions(), old => [
            ...(old || []),
            { ...data, id }
         ]);

         return { previousDrafts, previousSubmissions };
      },
      onError: (_err, _vars, context) => {
         if (context?.previousDrafts) {
            queryClient.setQueryData(salaryKeys.drafts(), context.previousDrafts);
         }
         if (context?.previousSubmissions) {
            queryClient.setQueryData(salaryKeys.submissions(), context.previousSubmissions);
         }
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: salaryKeys.drafts() });
         queryClient.invalidateQueries({ queryKey: salaryKeys.submissions() });
      }
   });

   return {
      submissions: submissionsMap,
      draftSubmissions: draftsList,
      companyPositions: companyPositionsList,
      processing,
      isLoading: isLoadingSubmissions || isLoadingDrafts || isLoadingPositions,

      actions: {
         addSubmission: async (id, submission) => {
            await addSubmissionMutation.mutateAsync({ id, submission });
         },

         updateSubmission: async (id, submission) => {
            await updateSubmissionMutation.mutateAsync({ id, submission });
         },

         removeSubmission: async id => {
            await removeSubmissionMutation.mutateAsync(id);
         },

         addDraftSubmission: async submission => {
            await addDraftMutation.mutateAsync(submission);
         },

         updateDraftSubmission: async (index, submission) => {
            await updateDraftMutation.mutateAsync({ index, submission });
         },

         removeDraftSubmission: async index => {
            await removeDraftMutation.mutateAsync(index);
         },

         moveDraftToSubmission: async (draftIndex, id, data) => {
            await moveDraftToSubmissionMutation.mutateAsync({ draftIndex, id, data });
         },

         clearDraftSubmissions: async () => {
            await clearDraftsMutation.mutateAsync();
         },

         setProcessing: (isProcessing: boolean) => {
            setProcessing(isProcessing);
         },

         replaceAllSubmissions: async subs => {
            await replaceAllSubmissionsMutation.mutateAsync(subs);
         }
      }
   };
}

export { salaryKeys };

