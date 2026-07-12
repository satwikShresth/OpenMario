import { createWorker, PSM, type Worker } from 'tesseract.js';
import { env } from '@env';

const ALLOWED_MIME = new Set([
   'image/png',
   'image/jpeg',
   'image/webp',
   'image/jpg'
]);

let worker: Worker | null = null;
let progressCb: ((progress: number, status: string) => void) | undefined;

async function getWorker(): Promise<Worker> {
   if (!worker) {
      worker = await createWorker('eng', undefined, {
         logger: m => {
            if (
               m.status === 'recognizing text' &&
               typeof m.progress === 'number'
            ) {
               progressCb?.(m.progress, m.status);
            }
         }
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
   }
   return worker;
}

export function validateImageInput(imageBase64: string, mimeType: string) {
   if (!ALLOWED_MIME.has(mimeType)) {
      throw new Error(
         `Unsupported image type "${mimeType}". Use image/png, image/jpeg, or image/webp.`
      );
   }
   const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
   if (approxBytes > env.MCP_MAX_IMAGE_BYTES) {
      throw new Error(
         `Image too large (~${approxBytes} bytes). Max is ${env.MCP_MAX_IMAGE_BYTES} bytes.`
      );
   }
}

export async function recognizeImage(
   imageBase64: string,
   mimeType: string,
   onProgress?: (progress: number, status: string) => void
): Promise<string> {
   validateImageInput(imageBase64, mimeType);
   progressCb = onProgress;
   try {
      const w = await getWorker();
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;
      const {
         data: { text }
      } = await w.recognize(dataUrl);
      return text ?? '';
   } finally {
      progressCb = undefined;
   }
}

export async function shutdownOcr() {
   if (worker) {
      await worker.terminate();
      worker = null;
   }
}
