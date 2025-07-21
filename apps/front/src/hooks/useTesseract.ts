import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorker, PSM } from 'tesseract.js';

export const useTesseract = () => {
   const [isProcessing, setIsProcessing] = useState(false);
   const workerRef = useRef<Tesseract.Worker | null>(null);

   useEffect(() => {
      const initTesseract = async () => {
         setIsProcessing(true);

         workerRef.current = (await createWorker('eng')
            .then(async (worker: Tesseract.Worker) => {
               await worker.setParameters({
                  tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD,
               });
               return worker;
            })
            .catch((error) => {
               console.error('Failed to initialize Tesseract:', error);
            })
            .finally(() => {
               setIsProcessing(false);
            })) || null;
      };

      initTesseract();

      return () => {
         if (workerRef.current) {
            workerRef.current
               .terminate()
               .catch((e) => console.error('Error terminating worker:', e));
         }
      };
   }, []);

   const recognizeText = useCallback(async (imageUrl: File) => {
      if (!workerRef.current) {
         const error = new Error('Tesseract worker not initialized');
         throw error;
      }

      setIsProcessing(true);

      return await workerRef.current
         .recognize(imageUrl)
         .then((result) => result.data.text)
         .catch((error) => {
            console.error(`Error: ${error.message}`);
            throw error;
         })
         .finally(() => setIsProcessing(false));
   }, []);

   return {
      isProcessing,
      recognizeText,
   };
};
