import { orpc, withAuth, withBrowser } from './helpers';
import { type Page } from 'playwright';
import { extractSection } from '@/scraper/extract';
import { BASE_URL, withRetry } from '@/scraper/utils';
import { appendSection } from '@/db/store';

const NAV_TIMEOUT = 60_000;

export const scraperCrawlProcedure = orpc.scrape.crawl
   .use(withAuth)
   .use(withBrowser)
   .handler(async ({ input, context }) => {
      const { page: sharedPage, browserCtx } = context;

      if (sharedPage) {
         return scrapeWithPage(sharedPage, input);
      }

      const page = await browserCtx!.newPage();
      page.setDefaultTimeout(NAV_TIMEOUT);
      await withRetry(() =>
         page.goto(
            `${BASE_URL}/collegesSubjects/${input.termId}?collCode=${input.collegeCode}`,
            { waitUntil: 'domcontentloaded' }
         )
      );
      const count = await scrapeWithPage(page, input);
      await page.close();
      return count;
   });

async function scrapeWithPage(
   page: Page,
   input: { subjectCode: string; collegeCode: string; termId: number }
): Promise<number> {
   const crnLinks = await withRetry(async () => {
      await page.goto(`${BASE_URL}/courseList/${input.subjectCode}`, {
         waitUntil: 'domcontentloaded'
      });
      return page.$$eval('a[href*="courseDetails"]', els =>
         els.map(a => ({
            href: a.getAttribute('href') ?? '',
            crn: parseInt(a.textContent?.trim() ?? '0') || 0
         }))
      );
   });

   const detailUrls = crnLinks
      .filter(l => l.crn > 0)
      .map(({ href, crn }) => {
         const courseNumber = href.match(/crseNumb=(\d+)/)?.[1] ?? '';
         return `${BASE_URL}/courseDetails/${crn}?crseNumb=${courseNumber}`;
      });

   console.log(
      `    Found ${detailUrls.length} sections for ${input.subjectCode}`
   );

   let count = 0;
   for (const url of detailUrls) {
      const scraped = await withRetry(async () => {
         await page.goto(url, { waitUntil: 'domcontentloaded' });
         return extractSection(page);
      });
      if (scraped && scraped.crn > 0) {
         appendSection(scraped);
         count++;
      }
   }

   return count;
}
