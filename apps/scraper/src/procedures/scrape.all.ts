import { call } from '@orpc/server';
import { orpc, withAuth, withBrowser } from './helpers';
import { scrapeSubjectProcedure } from './scrape.subject';
import { subject, college } from '@openmario/db';
import { asc, eq } from 'drizzle-orm';
import { BASE_URL } from '@/scraper/utils';

const NAV_TIMEOUT = 60_000;

export const scrapeAllProcedure = orpc.scrape.all
   .use(withAuth)
   .use(withBrowser)
   .handler(async ({ input, context }) => {
      const { neon, browserCtx, authFile } = context;

      const rows = await neon
         .select({
            collegeId: college.id,
            collegeName: college.name,
            subjectId: subject.id,
            subjectName: subject.name
         })
         .from(college)
         .innerJoin(subject, eq(subject.college_id, college.id))
         .orderBy(asc(college.id), asc(subject.id));

      const byCollege = Map.groupBy(rows, r => r.collegeId);
      console.log(
         `Found ${byCollege.size} colleges, ${rows.length} subjects for term ${input.termId}…`
      );

      const page = await browserCtx!.newPage();
      page.setDefaultTimeout(NAV_TIMEOUT);
      const contextWithPage = { ...context, authFile: authFile!, page };
      const results = [];

      for (const [collegeId, subjects] of byCollege) {
         const collegeName = subjects[0]!.collegeName;
         console.log(
            `\n[${collegeId}] ${collegeName} — ${subjects.length} subjects`
         );

         await page.goto(
            `${BASE_URL}/collegesSubjects/${input.termId}?collCode=${collegeId}`,
            { waitUntil: 'domcontentloaded' }
         );

         for (const [i, sub] of subjects.entries()) {
            console.log(
               `  [${i + 1}/${subjects.length}] ${sub.subjectId} — ${sub.subjectName}`
            );
            try {
               const result = await call(
                  scrapeSubjectProcedure,
                  {
                     subjectCode: sub.subjectId,
                     subjectName: sub.subjectName,
                     collegeCode: collegeId,
                     termId: input.termId
                  },
                  { context: contextWithPage }
               );
               results.push({ subjectCode: sub.subjectId, ...result });
            } catch (err) {
               console.error(
                  `    ✕ Failed: ${err instanceof Error ? err.message : String(err)}`
               );
               results.push({
                  subjectCode: sub.subjectId,
                  sectionsFound: 0,
                  error: String(err)
               });
            }
         }
      }

      await page.close();
      return results;
   });
