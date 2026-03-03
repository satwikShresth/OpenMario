import { listSubjectsProcedure } from './subjects.list';
import { scrapeSubjectProcedure } from './scrape.subject';
import { scrapeAllProcedure } from './scrape.all';
import { scraperCrawlProcedure } from './scrape.crawl';
import { scraperAuthProcedure } from './auth';

export const router = {
   auth: scraperAuthProcedure,
   subjects: {
      list: listSubjectsProcedure
   },
   scrape: {
      subject: scrapeSubjectProcedure,
      all: scrapeAllProcedure,
      crawl: scraperCrawlProcedure
   }
};

export type Router = typeof router;
