import { call } from '@orpc/server';
import { orpc, withAuth, withBrowser } from './helpers';
import { scraperCrawlProcedure } from './scrape.crawl';

export const scrapeSubjectProcedure = orpc.scrape.subject
   .use(withAuth)
   .use(withBrowser)
   .handler(async ({ input, context }) => {
      const sectionsFound = await call(
         scraperCrawlProcedure,
         {
            subjectCode: input.subjectCode,
            collegeCode: input.collegeCode,
            termId: input.termId
         },
         { context }
      );
      return { sectionsFound };
   });
