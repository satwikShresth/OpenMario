import { createHash, randomBytes } from 'node:crypto';
import { env } from '@env';

export type PendingUpload = {
   createdAt: number;
   mimeType?: string;
   imageBase64?: string;
};

const TTL_MS = 15 * 60 * 1000;
const pending = new Map<string, PendingUpload>();

export function createUploadSlot(): string {
   const id = randomBytes(16).toString('hex');
   pending.set(id, { createdAt: Date.now() });
   return id;
}

export function getUploadSlot(id: string): PendingUpload | null {
   const entry = pending.get(id);
   if (!entry) return null;
   if (Date.now() - entry.createdAt > TTL_MS) {
      pending.delete(id);
      return null;
   }
   return entry;
}

export function storeUploadBytes(
   id: string,
   bytes: Uint8Array,
   mimeType: string
): void {
   const entry = getUploadSlot(id);
   if (!entry) throw new Error(`Unknown or expired upload_id: ${id}`);
   if (bytes.byteLength > env.MCP_MAX_IMAGE_BYTES) {
      throw new Error(
         `Image too large (${bytes.byteLength} bytes). Max is ${env.MCP_MAX_IMAGE_BYTES} bytes.`
      );
   }
   // Bun/Node Buffer
   const imageBase64 = Buffer.from(bytes).toString('base64');
   pending.set(id, {
      createdAt: entry.createdAt,
      mimeType,
      imageBase64
   });
}

export function storeUploadBase64(
   id: string,
   imageBase64: string,
   mimeType: string
): void {
   const cleaned = stripDataUrl(imageBase64);
   const approxBytes = Math.ceil((cleaned.length * 3) / 4);
   if (approxBytes > env.MCP_MAX_IMAGE_BYTES) {
      throw new Error(
         `Image too large (~${approxBytes} bytes). Max is ${env.MCP_MAX_IMAGE_BYTES} bytes.`
      );
   }
   const entry = getUploadSlot(id);
   if (!entry) throw new Error(`Unknown or expired upload_id: ${id}`);
   pending.set(id, {
      createdAt: entry.createdAt,
      mimeType,
      imageBase64: cleaned
   });
}

export function takeUpload(
   id: string
): { imageBase64: string; mimeType: string } | null {
   const entry = getUploadSlot(id);
   if (!entry?.imageBase64) return null;
   pending.delete(id);
   return {
      imageBase64: entry.imageBase64,
      mimeType: entry.mimeType ?? 'image/png'
   };
}

export function stripDataUrl(input: string): string {
   const trimmed = input.trim();
   const match = /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/s.exec(trimmed);
   return match?.[1]?.replace(/\s+/g, '') ?? trimmed.replace(/\s+/g, '');
}

export function publicBaseUrl(): string {
   const fromEnv = process.env.MCP_PUBLIC_BASE_URL?.replace(/\/$/, '');
   if (fromEnv) return fromEnv;
   if (env.NODE_ENV === 'production') return 'https://mcp.openmario.com';
   return `http://127.0.0.1:${env.MCP_PORT}`;
}

export function pruneUploadCache() {
   const now = Date.now();
   for (const [key, entry] of pending) {
      if (now - entry.createdAt > TTL_MS) pending.delete(key);
   }
}

export function hashBytes(bytes: Uint8Array): string {
   return createHash('sha256').update(bytes).digest('hex');
}
