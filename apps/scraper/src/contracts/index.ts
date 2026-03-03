export * from './subjects';
export * from './scrape';

import { listSubjectsContract } from './subjects';
import {
   authContract,
   crawlSubjectContract,
   scrapeSubjectContract,
   scrapeAllContract
} from './scrape';

export const scraperContracts = {
   auth: authContract,
   subjects: {
      list: listSubjectsContract
   },
   scrape: {
      subject: scrapeSubjectContract,
      all: scrapeAllContract,
      crawl: crawlSubjectContract
   }
};
