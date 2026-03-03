import { env } from '@env';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { BASE_URL } from '@/scraper/utils';

export const AUTH_FILE = join(env.DATA_DIR, '.auth', 'session.json');

export async function isSessionValid(authFile: string): Promise<boolean> {
   if (!existsSync(authFile)) return false;
   try {
      const { cookies } = await import(authFile, { with: { type: 'json' } }) as {
         cookies: { name: string; expires: number; domain: string }[];
      };
      const now = Date.now() / 1000;
      const tmsCookies = cookies.filter(c => c.domain.includes('drexel.edu'));
      return tmsCookies.length > 0 && tmsCookies.every(c => c.expires === -1 || c.expires > now);
   } catch {
      return false;
   }
}

export async function loginWithBrowser(authFile: string): Promise<void> {
   mkdirSync(join(env.DATA_DIR, '.auth'), { recursive: true });
   const browser = await chromium.launch({ headless: false });
   try {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}/collegesSubjects`, { waitUntil: 'domcontentloaded' });

      const emailInput = page.locator('input[name="loginfmt"], input[type="email"]').first();
      if (await emailInput.isVisible({ timeout: 10_000 }).catch(() => false)) {
         await emailInput.fill(env.DREXEL_USERNAME!);
         await page.click('input[type="submit"], button[type="submit"]');
         await page.waitForLoadState('domcontentloaded');

         const passwordInput = page.locator('input[name="passwd"], input[type="password"]').first();
         await passwordInput.waitFor({ timeout: 15_000 });
         await passwordInput.fill(env.DREXEL_PASSWORD!);
         await page.click('input[type="submit"], button[type="submit"]');
         await page.waitForLoadState('domcontentloaded');

         const stayBtn = page.locator('input[type="button"][value="No"]');
         if (await stayBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await stayBtn.click();
            await page.waitForLoadState('domcontentloaded');
         }
      }

      console.log('Waiting for MFA approval and redirect to TMS (up to 2 minutes)…');
      await page.waitForURL('**/termmasterschedule.drexel.edu/**', { timeout: 120_000 });
      await ctx.storageState({ path: authFile });
      await ctx.close();
   } finally {
      await browser.close();
   }
}
