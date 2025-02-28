import { useCallback } from 'react';
import JobList from '#/component/Job/List';
import useTesseract from '#/hooks/useTesseract';
import useJobParser from '#/hooks/useJobParser';
import { enqueueSnackbar } from 'notistack';
import type { CommonData } from '#/types';

export default () => {
  const { recognizeText } = useTesseract();
  const {
    processedJobs,
    setProcessedJobs,
    processText
  } = useJobParser();

  const processFile = useCallback(async (file: File, common: CommonData) => {
    if (!file) return;
    setProcessedJobs([]);

    await recognizeText(file)
      .then((text) => processText(text, common))
      .catch(({ message }) => {
        console.error(`Error: ${message}`);
        enqueueSnackbar(message, { variant: "error" })
      });
  }, [recognizeText, processText, setProcessedJobs]);

  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      <div className="mt-4">
        <JobList jobs={processedJobs} onFileSelect={processFile} />
      </div>
    </div>
  );
};
