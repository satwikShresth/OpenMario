export const BASE_URL = 'https://termmasterschedule.drexel.edu/webtms_du';

export function sleep(ms: number): Promise<void> {
   return new Promise(resolve => setTimeout(resolve, ms));
}

export async function withRetry<T>(
   fn: () => Promise<T>,
   retries = 2,
   delayMs = 1000
): Promise<T> {
   let lastErr: unknown;
   for (let i = 0; i <= retries; i++) {
      try {
         return await fn();
      } catch (err) {
         lastErr = err;
         if (i < retries) await sleep(delayMs * (i + 1));
      }
   }
   throw lastErr;
}
