import { getNeonDb } from '@/db/neon';
import {
   chromium,
   type Browser,
   type BrowserContext,
   type Page
} from 'playwright';
import { implement } from '@orpc/server';
import { scraperContracts } from '@/contracts';
import { AUTH_FILE, isSessionValid, loginWithBrowser } from '@/scraper/auth';

export interface ScraperContext {
   neon: ReturnType<typeof getNeonDb>;
   browser?: Browser;
   browserCtx?: BrowserContext;
   authFile?: string;
   page?: Page;
}

const base = implement(scraperContracts).$context<ScraperContext>();

const withNeon = base.middleware(({ context, next }) =>
   next({ context: { ...context, neon: getNeonDb() } })
);

export const withAuth = base.middleware(async ({ context, next }) => {
   if (context.authFile) return next({ context });

   if (await isSessionValid(AUTH_FILE)) {
      console.log(`Auth: reused existing session (${AUTH_FILE})`);
      return next({ context: { ...context, authFile: AUTH_FILE } });
   }

   await loginWithBrowser(AUTH_FILE);
   return next({ context: { ...context, authFile: AUTH_FILE } });
});

export const withBrowser = base.middleware(async ({ context, next }) => {
   if (context.browser && context.browserCtx) return next({ context });

   if (!context.authFile)
      throw new Error('withBrowser requires authFile — chain withAuth first');

   const storageState = await import(context.authFile, {
      with: { type: 'json' }
   });
   const browser = await chromium.launch({ headless: false, slowMo: 500 });
   const browserCtx = await browser.newContext({ storageState });

   try {
      return await next({ context: { ...context, browser, browserCtx } });
   } finally {
      await browserCtx.close().catch(() => {});
      await browser.close().catch(() => {});
   }
});

export const orpc = base.use(withNeon);
