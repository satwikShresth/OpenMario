import type { SubmissionAggregate } from '@openmario/server/contracts';
import { useCallback, useState } from 'react';

type Submission = Omit<SubmissionAggregate, 'details'> & {
   position_id: string;
   employer_id: string;
   job_length: string;
   status: string;
   weekly_pay: string;
   ranking_status: string;
   coop_round: 'A' | 'B' | 'C';
};
interface CommonData
   extends Pick<
      Submission,
      'year' | 'coop_year' | 'coop_cycle' | 'program_level'
   > {
   coop_round: 'A' | 'B' | 'C';
}

export const useJobParser = () => {
   const [processedJobs, setProcessedJobs] = useState<Submission[]>([]);

   const parseJobs = useCallback(
      (text: string, common: CommonData): Submission[] => {
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
            fullWage:
               /\$(\d+\.\d+)\/hour\s+for\s+(\d+)\/week\s+=\s+\$(\d+\.\d+)/
         };

         const cleanedLines = text
            .replace(/^---\n/, '')
            .replace(/\n---$/, '')
            .replace(/Records \d+ to \d+ of \d+ shown\n/g, '')
            .split('\n')
            .filter(line => line.trim());

         const jobStartIndices = cleanedLines
            .map((line, idx) => (patterns.positionHeader.test(line) ? idx : -1))
            .filter(idx => idx !== -1);

         const jobBlocks = jobStartIndices.map((startIdx, idx) =>
            cleanedLines.slice(
               startIdx,
               idx < jobStartIndices.length - 1
                  ? jobStartIndices[idx + 1]
                  : cleanedLines.length
            )
         );

         return jobBlocks
            .map(jobLines => ({
               headerLine: jobLines[0],
               contentLines: jobLines.slice(1),
               fullText: jobLines.join('\n'),
               extract: (text: string, pattern: RegExp, group = 1): string =>
                  text?.match(pattern)?.at(group)?.trim() || ''
            }))
            .map(({ headerLine, contentLines, fullText, extract }) => {
               const extractSection = (sectionName: string): string => {
                  const index = contentLines.findIndex(
                     line =>
                        line.trim() === `${sectionName}:` ||
                        line.trim().startsWith(`${sectionName}:`)
                  );
                  if (index === -1) return '';

                  const restLines = contentLines
                     .slice(index + 1)
                     .map(line => line.trim());
                  const breakIndex = restLines.findIndex(
                     line => line.includes(':') && !line.startsWith('$')
                  );
                  const sectionContent =
                     breakIndex === -1
                        ? restLines
                        : restLines.slice(0, breakIndex);

                  return [
                     contentLines[index]!.replace(`${sectionName}:`, '').trim(),
                     ...sectionContent
                  ]
                     .join(' ')
                     .trim();
               };

               const hasKeyword = (keyword: string): boolean =>
                  contentLines.some(line => line.trim() === keyword);

               const position = extract(headerLine!, patterns.position);
               const position_id = extract(headerLine!, patterns.position, 2);
               const company = extract(headerLine!, patterns.employer) || '';
               const employer_id = extract(headerLine!, patterns.employer, 2);
               const job_length = extract(headerLine!, patterns.jobLength);
               const location = extract(headerLine!, patterns.location);

               const rankingStatusText = extractSection('Ranking Status');
               const wagesText = extractSection('Wages');
               const otherCompText = extractSection('Other Compensation');

               const determineStatus = (): string => {
                  if (hasKeyword('Accepted')) return 'Accepted';
                  if (hasKeyword('Job Offer')) return 'Job Offer';
                  if (hasKeyword('Qualified Alternate'))
                     return 'Qualified Alternate';

                  if (rankingStatusText.includes('Job Offer'))
                     return 'Job Offer';
                  if (rankingStatusText.includes('Qualified Alternate')) {
                     return 'Qualified Alternate';
                  }
                  if (rankingStatusText.includes('Accepted')) return 'Accepted';

                  return '';
               };

               const status = determineStatus();

               const hourlyWage = extract(wagesText, patterns.hourlyWage);
               const hoursPerWeek = extract(wagesText, patterns.hoursPerWeek);
               const weeklyPay = extract(wagesText, patterns.weeklyPay);

               const fullWageMatch = fullText.match(patterns.fullWage);

               const job: Submission = {
                  ...common,
                  company,
                  position,
                  position_id,
                  employer_id,
                  job_length,
                  location,
                  ranking_status: rankingStatusText || status || '',
                  compensation: parseInt(
                     hourlyWage || (fullWageMatch ? `$${fullWageMatch[1]}` : '')
                  ),
                  work_hours: parseInt(
                     hoursPerWeek || (fullWageMatch ? fullWageMatch[2]! : '')
                  )!,
                  weekly_pay:
                     weeklyPay || (fullWageMatch ? `$${fullWageMatch[3]}` : ''),
                  status,
                  other_compensation: otherCompText
               };

               return job;
            });
      },
      []
   );

   const processText = useCallback(
      (text: string, common: CommonData): Submission[] => {
         const jobs = parseJobs(text, common);
         setProcessedJobs(jobs);
         return jobs;
      },
      [parseJobs]
   );

   return {
      processedJobs,
      setProcessedJobs,
      parseJobs,
      processText
   };
};
