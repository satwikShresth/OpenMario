import { orpc } from './helpers';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '@env';
import { AUTH_FILE, isSessionValid, loginWithBrowser } from '@/scraper/auth';

export { AUTH_FILE };

export const scraperAuthProcedure = orpc.auth.handler(
   async ({ input: { email: _email, password: _password } }) => {
      mkdirSync(join(env.DATA_DIR, '.auth'), { recursive: true });

      if (await isSessionValid(AUTH_FILE)) {
         console.log(`Auth: reused existing session (${AUTH_FILE})`);
         return { authFile: AUTH_FILE, reused: true };
      }

      await loginWithBrowser(AUTH_FILE);
      return { authFile: AUTH_FILE, reused: false };
   }
);
