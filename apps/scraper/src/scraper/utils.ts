export const BASE_URL = 'https://termmasterschedule.drexel.edu/webtms_du';

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
   let lastErr: unknown;
   for (let i = 0; i <= retries; i++) {
      try {
         return await fn();
      } catch (err) {
         lastErr = err;
      }
   }
   throw lastErr;
}
