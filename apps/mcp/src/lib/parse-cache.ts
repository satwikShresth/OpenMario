import { createHash } from 'node:crypto';
import type { OffersCommon, ParsedOffer } from './offers-parser';

type CacheEntry = {
   offers: ParsedOffer[];
   common: OffersCommon;
   createdAt: number;
};

const TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function hashImage(imageBase64: string): string {
   return createHash('sha256').update(imageBase64).digest('hex');
}

export function storeParse(
   imageHash: string,
   common: OffersCommon,
   offers: ParsedOffer[]
): string {
   const token = createHash('sha256')
      .update(`${imageHash}:${Date.now()}:${Math.random()}`)
      .digest('hex')
      .slice(0, 32);
   cache.set(token, { offers, common, createdAt: Date.now() });
   return token;
}

export function getParse(token: string): CacheEntry | null {
   const entry = cache.get(token);
   if (!entry) return null;
   if (Date.now() - entry.createdAt > TTL_MS) {
      cache.delete(token);
      return null;
   }
   return entry;
}

export function pruneParseCache() {
   const now = Date.now();
   for (const [key, entry] of cache) {
      if (now - entry.createdAt > TTL_MS) cache.delete(key);
   }
}
