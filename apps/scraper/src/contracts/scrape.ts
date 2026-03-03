import { oc } from '@orpc/contract';
import { env } from '@env';
import { z } from 'zod';

export const OfferingHistoryEntrySchema = z.object({
   year: z.string(),
   fall: z.boolean(),
   winter: z.boolean(),
   spring: z.boolean(),
   summer: z.boolean()
});

export const DayOfWeekSchema = z.enum([
   'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]);

export const CleanSectionSchema = z.object({
   crn: z.number(),
   subjectCode: z.string(),
   courseNumber: z.string(),
   section: z.string(),
   campus: z.string(),
   maxEnroll: z.number().nullable(),
   startTime: z.string().nullable(),
   endTime: z.string().nullable(),
   instrType: z.string(),
   instrMethod: z.string(),
   days: z.array(DayOfWeekSchema),
   building: z.string(),
   room: z.string(),
   instructors: z.array(z.string()),
   offeringHistory: z.array(OfferingHistoryEntrySchema)
});

export const ScrapeSubjectInputSchema = z
   .object({
      subjectCode: z
         .string()
         .describe('Subject code to scrape (e.g. CS, MATH)'),
      collegeCode: z
         .string()
         .describe(
            'College code used in the collegesSubjects URL (e.g. GC, EN)'
         ),
      subjectName: z
         .string()
         .optional()
         .default('')
         .describe(
            'Human-readable name of the subject, used for labeling the run'
         ),
      termId: z
         .number()
         .describe('Drexel term ID identifying which academic term to scrape')
   })
   .describe('Input for triggering a scrape of a single subject');

export const ScrapeSubjectOutputSchema = z
   .object({
      sectionsFound: z
         .number()
         .describe('Number of sections scraped and written')
   })
   .describe('Result of a single-subject scrape operation');

export const ScrapeAllInputSchema = z
   .object({
      termId: z
         .number()
         .describe(
            'Drexel term ID identifying which academic term to scrape all subjects for'
         )
   })
   .describe('Input for triggering a scrape of all available subjects');

export const ScrapeAllResultSchema = z
   .object({
      subjectCode: z.string().describe('Subject code that was scraped'),
      sectionsFound: z
         .number()
         .describe('Number of sections scraped for this subject'),
      error: z
         .string()
         .optional()
         .describe('Error message if this subject scrape failed')
   })
   .describe('Per-subject result from a bulk scrape operation');

export const CrawlInputSchema = z
   .object({
      subjectCode: z.string().describe('Subject code to crawl (e.g. CS, MATH)'),
      collegeCode: z
         .string()
         .describe('College code for the collegesSubjects URL (e.g. GC, EN)'),
      termId: z.number().describe('Drexel term ID')
   })
   .describe('Input for the low-level Playwright crawl of a single subject');

export const scrapeSubjectContract = oc
   .route({
      method: 'POST',
      path: '/scrape/subject',
      summary: 'Scrape a single subject',
      tags: ['Scrape']
   })
   .input(ScrapeSubjectInputSchema)
   .output(ScrapeSubjectOutputSchema);

export const scrapeAllContract = oc
   .route({
      method: 'POST',
      path: '/scrape/all',
      summary: 'Scrape all subjects for a term',
      tags: ['Scrape']
   })
   .input(ScrapeAllInputSchema)
   .output(
      z
         .array(ScrapeAllResultSchema)
         .describe('Per-subject results for every subject scraped in the term')
   );

export const crawlSubjectContract = oc
   .input(CrawlInputSchema)
   .output(z.number().describe('Number of sections scraped and appended'));

export const authContract = oc
   .input(
      z.object({
         email: z
            .string()
            .optional()
            .transform(val => {
               const result = val ?? env.DREXEL_USERNAME;
               if (!result)
                  throw new Error(
                     'email is required (no input and DREXEL_USERNAME is not set)'
                  );
               return result;
            })
            .describe('Drexel email, defaults to DREXEL_USERNAME env var'),
         password: z
            .string()
            .optional()
            .transform(val => {
               const result = val ?? env.DREXEL_PASSWORD;
               if (!result)
                  throw new Error(
                     'password is required (no input and DREXEL_PASSWORD is not set)'
                  );
               return result;
            })
            .describe('Drexel password, defaults to DREXEL_PASSWORD env var')
      })
   )
   .output(
      z.object({
         authFile: z.string().describe('Path to the saved storageState file'),
         reused: z
            .boolean()
            .describe('Whether an existing valid session was reused')
      })
   );

export const scrapeContracts = {
   subject: scrapeSubjectContract,
   all: scrapeAllContract,
   crawl: crawlSubjectContract,
   auth: authContract
};
