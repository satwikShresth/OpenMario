import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

const TesseractOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [processedJobs, setProcessedJobs] = useState([]);
  const [preprocessedImageUrl, setPreprocessedImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);

  // Initialize Tesseract when component mounts
  useEffect(() => {
    const initTesseract = async () => {
      try {
        // Create worker with minimal configuration to avoid DataCloneError
        const worker = await createWorker('eng');
        workerRef.current = worker;

        addLog('Initialization complete', 1);
      } catch (error) {
        console.error('Failed to initialize Tesseract:', error);
        addLog('Error initializing Tesseract: ' + error.message, 0, true);
      }
    };

    initTesseract();

    // Clean up when component unmounts
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate().catch(e => { });
      }
    };
  }, []);

  // Simple logging function
  const addLog = (message, progress = 0, isError = false) => {
    setLogMessages(prev => [{
      message,
      progress,
      isError,
      timestamp: new Date()
    }, ...prev]);
  };

  // Preprocess image - remove green elements
  const preprocessImage = async (file) => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.onload = () => {
          // Create canvas for image processing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Remove green elements
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is predominantly green, make it white
            if (g > 100 && g > r * 1.2 && g > b * 1.2) {
              data[i] = 255;     // R
              data[i + 1] = 255; // G
              data[i + 2] = 255; // B
            }
          }

          // Enhance contrast
          for (let i = 0; i < data.length; i += 4) {
            // Make dark colors darker and light colors lighter
            for (let j = 0; j < 3; j++) {
              if (data[i + j] < 120) {
                data[i + j] = Math.max(0, data[i + j] - 30);
              } else if (data[i + j] > 200) {
                data[i + j] = 255;
              }
            }
          }

          ctx.putImageData(imageData, 0, 0);

          const processedImageUrl = canvas.toDataURL('image/png');
          setPreprocessedImageUrl(processedImageUrl);
          resolve(processedImageUrl);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Parse job listings from text
  const parseJobs = (text) => {
    if (!text) return [];

    console.log("Raw OCR text:", text);

    // Split by job entries - look for patterns that typically start a new job
    const jobEntries = [];
    let currentJobText = '';

    // Split text into lines and process
    const lines = text.split('\n').filter(line => line.trim() !== '');

    let currentJobStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip record count lines
      if (line.match(/^Records \d+ to \d+ of \d+ shown$/)) {
        continue;
      }

      // Check if this line starts a new job entry (has position title and employer)
      const isJobHeader = (
        line.includes('Employer:') &&
        line.includes('Job Length:') &&
        line.includes('General Job Location:')
      );

      if (isJobHeader) {
        // If we were already building a job, save it
        if (currentJobText) {
          jobEntries.push(currentJobText);
          currentJobText = '';
        }

        // Start new job
        currentJobStartIndex = i;
        currentJobText = line + '\n';
      }
      // If we're in a job entry, add this line to the current job text
      else if (currentJobStartIndex >= 0) {
        currentJobText += line + '\n';
      }
    }

    // Add the last job if there is one
    if (currentJobText) {
      jobEntries.push(currentJobText);
    }

    console.log("Split into job entries:", jobEntries);

    // Process each job entry
    const jobs = jobEntries.map(jobText => {
      const jobLines = jobText.split('\n').filter(line => line.trim());
      const job = {};

      // Process header line (position, employer, job length, location)
      if (jobLines.length > 0) {
        const headerLine = jobLines[0];

        // Extract position
        const positionMatch = headerLine.match(/^(.*?)\s*\((\d+)\)\s*x\s*Employer:/);
        if (positionMatch) {
          job.position = positionMatch[1].trim();
          job.position_id = positionMatch[2];
        }

        // Extract employer
        const employerMatch = headerLine.match(/Employer:\s*(.*?)\s*\((\d+)\)\s*x\s*Job Length:/);
        if (employerMatch) {
          job.employer = employerMatch[1].trim();
          job.employer_id = employerMatch[2];
        }

        // Extract job length
        const jobLengthMatch = headerLine.match(/Job Length:\s*(.*?)\s*x\s*General Job Location:/);
        if (jobLengthMatch) {
          job.job_length = jobLengthMatch[1].trim();
        }

        // Extract location
        const locationMatch = headerLine.match(/General Job Location:\s*(.*?)$/);
        if (locationMatch) {
          job.location = locationMatch[1].trim();
        }
      }

      // Process remaining lines (status, wages, compensation, etc.)
      for (let i = 1; i < jobLines.length; i++) {
        const line = jobLines[i].trim();

        // Ranking status
        if (line.includes('Ranking Status:')) {
          job.ranking_status = line.replace('Ranking Status:', '').trim();
        }
        // Wages
        else if (line.includes('Wages:')) {
          const wagesMatch = line.match(/Wages:\s*\$(\d+\.\d+)\/hour\s*for\s*(\d+)\/week\s*=\s*\$(\d+\.\d+)/);
          if (wagesMatch) {
            job.hourly_wage = '$' + wagesMatch[1];
            job.hours_per_week = wagesMatch[2];
            job.weekly_pay = '$' + wagesMatch[3];
          }
        }
        // Other compensation
        else if (line.includes('Other Compensation:')) {
          job.other_compensation = line.replace('Other Compensation:', '').trim();
        }
        // Status keywords
        else if (line.includes('Accepted') || line.includes('Offer')) {
          job.status = line.trim();
        }
      }

      return job;
    });

    return jobs;
  };

  // Process file (common handler for file input and drag & drop)
  const processFile = async (file) => {
    if (!file || !workerRef.current) return;

    setIsProcessing(true);
    setLogMessages([]);
    setProcessedJobs([]);

    try {
      // Preprocess image
      addLog('Preprocessing image', 0.2);
      const processedImageUrl = await preprocessImage(file);
      addLog('Image preprocessing complete', 1);

      // Recognize text
      addLog('Recognizing text (this may take a while)', 0.1);

      // Perform OCR
      const result = await workerRef.current.recognize(processedImageUrl);
      const text = result.data?.text || result.text;

      addLog('OCR complete, processing results', 0.8);

      // Parse jobs from text
      const jobs = parseJobs(text);
      setProcessedJobs(jobs);

      addLog(`Processed ${jobs.length} job listings`, 1);
      addLog('Raw text: ' + text, 1);
    } catch (error) {
      console.error('Error processing image:', error);
      addLog('Error: ' + error.message, 0, true);
    } finally {
      setIsProcessing(false);
    }
  };

  // File input handler
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (fileInputRef.current) fileInputRef.current.value = '';
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="p-4 w-full max-w-6xl mx-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h2 className="text-xl font-semibold mb-4">Job Listing OCR Tool</h2>

      {/* File Upload Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start mb-3">
          <div className="flex-1">
            <label htmlFor="fileInput" className="block text-sm font-medium mb-1">
              Upload Image of Job Listings
            </label>
            <input
              type="file"
              id="fileInput"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {isProcessing ? "Processing..." : "Drag and drop image here"}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Image & Log */}
        <div className="space-y-4">
          {/* Processed Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Processed Image</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-900">
              {preprocessedImageUrl ? (
                <img
                  src={preprocessedImageUrl}
                  alt="Processed"
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400">
                  No image processed yet
                </div>
              )}
            </div>
          </div>

          {/* Process Log */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Process Log</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-900 h-80 overflow-y-auto">
              {logMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No processing activity yet
                </div>
              ) : (
                <div className="space-y-2">
                  {logMessages.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${log.isError ? 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-800'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{log.message}</span>
                        <span className="text-xs opacity-70">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {log.progress > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${log.progress * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Extracted Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="font-medium mb-2">Extracted Job Listings</h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto">
            {processedJobs.length === 0 ? (
              <div className="h-96 flex items-center justify-center text-gray-400">
                {isProcessing ? "Processing..." : "No jobs extracted yet"}
              </div>
            ) : (
              <div className="space-y-4">
                {processedJobs.map((job, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {job.position} {job.position_id && `(${job.position_id})`}
                    </div>

                    {job.employer && (
                      <div className="mb-1">
                        <span className="font-medium">Employer:</span> {job.employer}
                        {job.employer_id && `(${job.employer_id})`}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-4 text-sm my-1">
                      {job.job_length && (
                        <div><span className="font-medium">Length:</span> {job.job_length}</div>
                      )}
                      {job.location && (
                        <div><span className="font-medium">Location:</span> {job.location}</div>
                      )}
                    </div>

                    {job.ranking_status && (
                      <div className={`inline-block px-2 py-1 text-sm rounded mt-1 ${job.ranking_status.includes('Offer') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          job.ranking_status.includes('Qualified') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                        {job.ranking_status}
                      </div>
                    )}

                    {(job.hourly_wage || job.weekly_pay) && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Wages:</span> {job.hourly_wage}/hour
                        {job.hours_per_week && ` for ${job.hours_per_week}/week`}
                        {job.weekly_pay && ` = ${job.weekly_pay}`}
                      </div>
                    )}

                    {job.other_compensation && (
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Other Compensation:</span> {job.other_compensation}
                      </div>
                    )}

                    {job.status && (
                      <div className="mt-2 text-right">
                        <span className={`inline-block px-2 py-1 text-sm rounded ${job.status.includes('Accepted') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            job.status.includes('Offer') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {job.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesseractOCR;
