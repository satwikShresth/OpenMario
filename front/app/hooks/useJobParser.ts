import type { CommonData } from '#/types';
import { useState, useCallback } from 'react';

export interface Job extends CommonData {
   position?: string;
   position_id?: string;
   employer?: string;
   employer_id?: string;
   job_length?: string;
   location?: string;
   status?: string;
   ranking_status?: string;
   hourly_wage?: string;
   hours_per_week?: string;
   weekly_pay?: string;
   other_compensation?: string;
}

const useJobParser = () => {
   const [processedJobs, setProcessedJobs] = useState<Job[]>([]);

   const parseJobs = useCallback((text: string, common: CommonData): Job[] => {
      if (!text) return [];

      const positionPattern = /([A-Za-z\s\-&]+)\s+\((\d+)\)\s+x\s+Employer:/;
      const jobStartIndices: number[] = [];
      const jobEntries: { lines: string[], text: string }[] = [];

      const lines = text
         .replace(/^---\n/, '')
         .replace(/\n---$/, '')
         .replace(/Records \d+ to \d+ of \d+ shown\n/g, '')
         .split('\n')
         .filter(line => line.trim());

      for (let i = 0; i < lines.length; i++) {
         if (positionPattern.test(lines[i])) {
            jobStartIndices.push(i);
         }
      }

      for (let i = 0; i < jobStartIndices.length; i++) {
         const start = jobStartIndices[i];
         const end = i < jobStartIndices.length - 1 ? jobStartIndices[i + 1] : lines.length;
         const jobLines = lines.slice(start, end);
         jobEntries.push({
            lines: jobLines,
            text: jobLines.join('\n')
         });
      }

      // Process each job entry
      const jobs = jobEntries.map(({ lines, text }) => {
         const job: Job = { ...common };

         // Process header line (the first line containing position, employer, job length, location)
         const headerLine = lines[0];

         // Extract position and position ID
         const positionMatch = headerLine.match(/^([A-Za-z\s\-&]+)\s+\((\d+)\)/);
         if (positionMatch) {
            job.position = positionMatch[1].trim();
            job.position_id = positionMatch[2];
         }

         // Extract employer and employer ID
         const employerMatch = headerLine.match(/Employer:\s*([^(]+)\s*\((\d+)\)/);
         if (employerMatch) {
            job.employer = employerMatch[1].trim();
            job.employer_id = employerMatch[2];
         }

         // Extract job length
         const jobLengthMatch = headerLine.match(/Job Length:\s*([^x]+)/);
         if (jobLengthMatch) {
            job.job_length = jobLengthMatch[1].trim();
         }

         // Extract location
         const locationMatch = headerLine.match(/General Job Location:\s*([^\n]+)/);
         if (locationMatch) {
            job.location = locationMatch[1].trim();
         }

         // Process additional information
         const nonHeaderLines = lines.slice(1);

         // Find indices for various sections
         let rankingStatusIndex = -1;
         let wagesIndex = -1;
         let otherCompIndex = -1;

         for (let i = 0; i < nonHeaderLines.length; i++) {
            const line = nonHeaderLines[i].trim();
            if (line === "Ranking Status:" || line.startsWith("Ranking Status:")) {
               rankingStatusIndex = i;
            }
            if (line === "Wages:" || line.startsWith("Wages:")) {
               wagesIndex = i;
            }
            if (line.startsWith("Other Compensation:")) {
               otherCompIndex = i;
            }

            // Handle special status keywords
            if (line === "Accepted") {
               job.status = "Accepted";
            } else if (line === "Job Offer") {
               job.status = "Job Offer";
            } else if (line === "Qualified Alternate") {
               job.status = "Qualified Alternate";
            }
         }

         // Extract ranking status
         if (rankingStatusIndex !== -1) {
            let rankingStatus = nonHeaderLines[rankingStatusIndex].replace("Ranking Status:", "").trim();

            // Check if the next line contains additional status information
            if (rankingStatusIndex + 1 < nonHeaderLines.length &&
               !nonHeaderLines[rankingStatusIndex + 1].includes("Wages:") &&
               !nonHeaderLines[rankingStatusIndex + 1].includes("Other Compensation:") &&
               !nonHeaderLines[rankingStatusIndex + 1].startsWith("$")) {
               rankingStatus = nonHeaderLines[rankingStatusIndex + 1].trim();
            }

            if (rankingStatus) {
               job.ranking_status = rankingStatus;
            }
         }

         // Extract wages (which might span multiple lines)
         if (wagesIndex !== -1) {
            // Collect potential wage information lines
            const wageLines: string[] = [];
            for (let i = wagesIndex; i < nonHeaderLines.length; i++) {
               const line = nonHeaderLines[i].trim();
               if (line.startsWith("Wages:") || line.startsWith("$") ||
                  line.includes("/hour") || line.includes("/week")) {
                  wageLines.push(line);
               } else if (line.startsWith("Other Compensation:") ||
                  line === "Ranking Status:" ||
                  positionPattern.test(line)) {
                  break;
               }
            }

            const wageText = wageLines.join(" ");

            // Extract hourly wage
            const hourlyMatch = wageText.match(/\$(\d+\.\d+)\/hour/);
            if (hourlyMatch) {
               job.hourly_wage = "$" + hourlyMatch[1];
            }

            // Extract hours per week
            const hoursMatch = wageText.match(/for\s+(\d+)\/week/);
            if (hoursMatch) {
               job.hours_per_week = hoursMatch[1];
            }

            // Extract weekly pay
            const weeklyMatch = wageText.match(/=\s+\$(\d+\.\d+)/);
            if (weeklyMatch) {
               job.weekly_pay = "$" + weeklyMatch[1];
            }
         }

         // Extract other compensation
         if (otherCompIndex !== -1) {
            job.other_compensation = nonHeaderLines[otherCompIndex].replace("Other Compensation:", "").trim();
         }

         // If status wasn't found directly, try to infer it from ranking_status
         if (!job.status && job.ranking_status) {
            if (job.ranking_status.includes("Job Offer")) {
               job.status = "Job Offer";
            } else if (job.ranking_status.includes("Qualified Alternate")) {
               job.status = "Qualified Alternate";
            } else if (job.ranking_status.includes("Accepted")) {
               job.status = "Accepted";
            }
         }

         // If ranking_status wasn't found directly, but status was, use status for ranking_status
         if (!job.ranking_status && job.status) {
            job.ranking_status = job.status;
         }

         // Special case handling for the case where wage info appears before the Wages: label
         if (!job.hourly_wage && !job.weekly_pay) {
            // Look for wage pattern in the entire text
            const fullWagePattern = /\$(\d+\.\d+)\/hour\s+for\s+(\d+)\/week\s+=\s+\$(\d+\.\d+)/;
            const fullWageMatch = text.match(fullWagePattern);

            if (fullWageMatch) {
               job.hourly_wage = "$" + fullWageMatch[1];
               job.hours_per_week = fullWageMatch[2];
               job.weekly_pay = "$" + fullWageMatch[3];
            }
         }

         return job;
      });

      return jobs;
   }, []);

   const processText = useCallback((text: string, common: CommonData): Job[] => {
      const jobs = parseJobs(text, common);
      setProcessedJobs(jobs);
      return jobs;
   }, [parseJobs]);

   return {
      processedJobs,
      setProcessedJobs,
      parseJobs,
      processText
   };
};

export default useJobParser;
