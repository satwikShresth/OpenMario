import { useState, useRef, useEffect, useCallback } from 'react';
import { PSM, createWorker } from 'tesseract.js';
import { useSnackbar } from 'notistack';

export const useTesseract = () => {
   const [isProcessing, setIsProcessing] = useState(false);
   const workerRef = useRef<Tesseract.Worker | null>(null);
   const { enqueueSnackbar } = useSnackbar();

   useEffect(() => {
      const initTesseract = async () => {
         setIsProcessing(true);

         workerRef.current = await createWorker('eng')
            .then(async (worker: Tesseract.Worker) => {
               await worker.setParameters({
                  tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD,
               })
               return worker;
            })
            .catch((error) => {
               console.error('Failed to initialize Tesseract:', error);
               enqueueSnackbar(`Error initializing Tesseract: ${error.message}`, {
                  variant: 'error',
                  autoHideDuration: 4000
               });
            })
            .finally(() => {
               setIsProcessing(false);
            }) || null;
      };

      initTesseract();

      return () => {
         if (workerRef.current) {
            workerRef.current
               .terminate()
               .catch(e => console.error('Error terminating worker:', e));
         }
      };
   }, [enqueueSnackbar]);

   const recognizeText = useCallback(async (imageUrl: File) => {
      if (!workerRef.current) {
         const error = new Error('Tesseract worker not initialized');
         enqueueSnackbar(error.message, {
            variant: 'error',
            autoHideDuration: 3000
         });
         throw error;
      }

      setIsProcessing(true);
      enqueueSnackbar('Recognizing text (this may take a while)', {
         variant: 'info',
         autoHideDuration: 2000
      });

      return await workerRef.current
         .recognize(imageUrl)
         .then((result) => {
            enqueueSnackbar('Job Parsing Complete', {
               variant: 'success',
               autoHideDuration: 2000
            });

            return result.data.text
         })
         .catch((error) => {
            console.error(`Error: ${error.message}`)

            enqueueSnackbar(
               `Error while parsing image`,
               {
                  variant: 'error',
                  autoHideDuration: 4000
               }
            );
            throw error
         })
         .finally(() => setIsProcessing(false))

   }, [enqueueSnackbar]);

   return {
      isProcessing,
      recognizeText
   };
};
