import { useState, useRef, useEffect, useCallback } from 'react';
import { PSM, createWorker } from 'tesseract.js';
import { useSnackbar } from 'notistack';

const useTesseract = () => {
   const [isProcessing, setIsProcessing] = useState(false);
   const workerRef = useRef(null);
   const { enqueueSnackbar } = useSnackbar();

   useEffect(() => {
      const initTesseract = async () => {
         try {
            setIsProcessing(true);

            const worker = await createWorker('eng');
            await worker.setParameters({
               tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD,
            });
            workerRef.current = worker;
         } catch (error) {
            console.error('Failed to initialize Tesseract:', error);
            enqueueSnackbar(`Error initializing Tesseract: ${error.message}`, {
               variant: 'error',
               autoHideDuration: 4000
            });
         } finally {
            setIsProcessing(false);
         }
      };

      initTesseract();

      return () => {
         if (workerRef.current) {
            workerRef.current.terminate().catch(e => {
               console.error('Error terminating worker:', e);
            });
         }
      };
   }, [enqueueSnackbar]);

   const recognizeText = useCallback(async (imageUrl) => {
      if (!workerRef.current) {
         const error = new Error('Tesseract worker not initialized');
         enqueueSnackbar(error.message, {
            variant: 'error',
            autoHideDuration: 3000
         });
         throw error;
      }

      try {
         setIsProcessing(true);
         enqueueSnackbar('Recognizing text (this may take a while)', {
            variant: 'info',
            autoHideDuration: 2000
         });

         const result = await workerRef.current.recognize(imageUrl);
         const text = result.data?.text || result.text;

         enqueueSnackbar('Job Parsing Complete', {
            variant: 'success',
            autoHideDuration: 2000
         });

         return text;
      } catch (error) {
         enqueueSnackbar(`Error during OCR: ${error.message}`, {
            variant: 'error',
            autoHideDuration: 4000
         });
         throw error;
      } finally {
         setIsProcessing(false);
      }
   }, [enqueueSnackbar]);

   return {
      isProcessing,
      recognizeText
   };
};

export default useTesseract;
