import type { CommonData } from '#/types';
import type { compensation } from '#/utils/validators';
import { useState, useCallback } from 'react';

export interface Job extends CommonData {
   position?: string;
   position_id?: string;
   company?: string;
   employer_id?: string;
   job_length?: string;
   location?: string;
   status?: string;
   ranking_status?: string;
   compensation?: string;
   work_hours?: string;
   weekly_pay?: string;
   other_compensation?: string;
}

export const useJobParser = () => {
   const [processedJobs, setProcessedJobs] = useState<Job[]>([]);

   const parseJobs = useCallback((text: string, common: CommonData): Job[] => {
      if (!text) return [];

      const patterns = {
         positionHeader: /([A-Za-z\s\-&]+)\s+\((\d+)\)\s+x\s+Employer:/,
         position: /^([A-Za-z\s\-&]+)\s+\((\d+)\)/,
         employer: /Employer:\s*([^(]+)\s*\((\d+)\)/,
         jobLength: /Job Length:\s*([^x]+)/,
         location: /General Job Location:\s*([^\n]+)/,
         hourlyWage: /\$(\d+\.\d+)\/hour/,
         hoursPerWeek: /for\s+(\d+)\/week/,
         weeklyPay: /=\s+\$(\d+\.\d+)/,
         fullWage: /\$(\d+\.\d+)\/hour\s+for\s+(\d+)\/week\s+=\s+\$(\d+\.\d+)/
      };

      const cleanedLines = text
         .replace(/^---\n/, '')
         .replace(/\n---$/, '')
         .replace(/Records \d+ to \d+ of \d+ shown\n/g, '')
         .split('\n')
         .filter(line => line.trim());

      const jobStartIndices = cleanedLines
         .map((line, idx) => patterns.positionHeader.test(line) ? idx : -1)
         .filter(idx => idx !== -1);

      const jobBlocks = jobStartIndices.map((startIdx, idx) =>
         cleanedLines
            .slice(
               startIdx,
               idx < jobStartIndices.length - 1
                  ? jobStartIndices[idx + 1]
                  : cleanedLines.length
            )
      );


      return jobBlocks
         .map((jobLines) => (
            {
               headerLine: jobLines[0],
               contentLines: jobLines.slice(1),
               fullText: jobLines.join('\n'),
               extract: (text: string, pattern: RegExp, group = 1): string => text?.match(pattern)?.at(group)?.trim() || ''
            }
         ))
         .map(({ headerLine, contentLines, fullText, extract }) => {
            const extractSection = (sectionName: string): string => {
               const index = contentLines.findIndex(line =>
                  line.trim() === `${sectionName}:` || line.trim().startsWith(`${sectionName}:`)
               );
               if (index === -1) return '';

               const restLines = contentLines.slice(index + 1).map(line => line.trim());
               const breakIndex = restLines.findIndex(line => line.includes(':') && !line.startsWith('$'));
               const sectionContent = breakIndex === -1 ? restLines : restLines.slice(0, breakIndex);

               return [
                  contentLines[index].replace(`${sectionName}:`, '').trim(),
                  ...sectionContent
               ].join(' ').trim();
            };

            const hasKeyword = (keyword: string): boolean => contentLines.some(line => line.trim() === keyword);

            const position = extract(headerLine, patterns.position);
            const positionId = extract(headerLine, patterns.position, 2);
            const company = extract(headerLine, patterns.employer);
            const employerId = extract(headerLine, patterns.employer, 2);
            const jobLength = extract(headerLine, patterns.jobLength);
            const location = extract(headerLine, patterns.location);

            const rankingStatusText = extractSection('Ranking Status');
            const wagesText = extractSection('Wages');
            const otherCompText = extractSection('Other Compensation');

            const determineStatus = (): string => {
               if (hasKeyword('Accepted')) return 'Accepted';
               if (hasKeyword('Job Offer')) return 'Job Offer';
               if (hasKeyword('Qualified Alternate')) return 'Qualified Alternate';

               if (rankingStatusText.includes('Job Offer')) return 'Job Offer';
               if (rankingStatusText.includes('Qualified Alternate')) return 'Qualified Alternate';
               if (rankingStatusText.includes('Accepted')) return 'Accepted';

               return '';
            };

            const status = determineStatus();

            const hourlyWage = extract(wagesText, patterns.hourlyWage);
            const hoursPerWeek = extract(wagesText, patterns.hoursPerWeek);
            const weeklyPay = extract(wagesText, patterns.weeklyPay);

            const fullWageMatch = fullText.match(patterns.fullWage);

            const wageInfo = {
               compensation: hourlyWage || (fullWageMatch ? `$${fullWageMatch[1]}` : undefined),
               work_hours: hoursPerWeek || (fullWageMatch ? fullWageMatch[2] : undefined),
               weekly_pay: weeklyPay || (fullWageMatch ? `$${fullWageMatch[3]}` : undefined)
            };

            const job: Job = {
               ...common,
               ...(position && { position }),
               ...(positionId && { position_id: positionId }),
               ...(company && { company }),
               ...(employerId && { employer_id: employerId }),
               ...(jobLength && { job_length: jobLength }),
               ...(location && { location }),
               ...(rankingStatusText || status ? { ranking_status: rankingStatusText || status } : {}),
               ...(status && { status }),
               ...wageInfo,
               ...(otherCompText && { other_compensation: otherCompText })
            };

            return job;
         });
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
