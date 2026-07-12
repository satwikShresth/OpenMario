/**
 * Parses DrexelOne co-op rankings / offers page OCR text into structured offers.
 * Extracted from apps/client/src/hooks/useJobParser.ts for server reuse.
 */

export type CoopYear = '1st' | '2nd' | '3rd';
export type CoopCycle =
   | 'Fall/Winter'
   | 'Winter/Spring'
   | 'Spring/Summer'
   | 'Summer/Fall';
export type ProgramLevel = 'Undergraduate' | 'Graduate';

export type OffersCommon = {
   year: number;
   coop_year: CoopYear;
   coop_cycle: CoopCycle;
   program_level: ProgramLevel;
   coop_round: 'A' | 'B' | 'C';
};

export type ParsedOffer = OffersCommon & {
   company: string;
   position: string;
   position_id: string;
   employer_id: string;
   job_length: string;
   location: string;
   ranking_status: string;
   compensation: number;
   work_hours: number;
   weekly_pay: string;
   status: string;
   other_compensation: string;
};

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

export function parseOffersText(
   text: string,
   common: OffersCommon
): ParsedOffer[] {
   if (!text?.trim()) return [];

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

   return jobBlocks.map(jobLines => {
      const headerLine = jobLines[0]!;
      const contentLines = jobLines.slice(1);
      const fullText = jobLines.join('\n');

      const extract = (src: string, pattern: RegExp, group = 1): string =>
         src?.match(pattern)?.at(group)?.trim() || '';

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
            breakIndex === -1 ? restLines : restLines.slice(0, breakIndex);

         return [
            contentLines[index]!.replace(`${sectionName}:`, '').trim(),
            ...sectionContent
         ]
            .join(' ')
            .trim();
      };

      const hasKeyword = (keyword: string): boolean =>
         contentLines.some(line => line.trim() === keyword);

      const position = extract(headerLine, patterns.position);
      const position_id = extract(headerLine, patterns.position, 2);
      const company = extract(headerLine, patterns.employer) || '';
      const employer_id = extract(headerLine, patterns.employer, 2);
      const job_length = extract(headerLine, patterns.jobLength);
      const location = extract(headerLine, patterns.location);

      const rankingStatusText = extractSection('Ranking Status');
      const wagesText = extractSection('Wages');
      const otherCompText = extractSection('Other Compensation');

      const determineStatus = (): string => {
         if (hasKeyword('Accepted')) return 'Accepted';
         if (hasKeyword('Job Offer')) return 'Job Offer';
         if (hasKeyword('Qualified Alternate')) return 'Qualified Alternate';
         if (rankingStatusText.includes('Job Offer')) return 'Job Offer';
         if (rankingStatusText.includes('Qualified Alternate'))
            return 'Qualified Alternate';
         if (rankingStatusText.includes('Accepted')) return 'Accepted';
         return '';
      };

      const status = determineStatus();
      const hourlyWage = extract(wagesText, patterns.hourlyWage);
      const hoursPerWeek = extract(wagesText, patterns.hoursPerWeek);
      const weeklyPay = extract(wagesText, patterns.weeklyPay);
      const fullWageMatch = fullText.match(patterns.fullWage);

      return {
         ...common,
         company,
         position,
         position_id,
         employer_id,
         job_length,
         location,
         ranking_status: rankingStatusText || status || '',
         compensation: Number.parseInt(
            hourlyWage || (fullWageMatch ? fullWageMatch[1]! : '') || '0',
            10
         ),
         work_hours: Number.parseInt(
            hoursPerWeek || (fullWageMatch ? fullWageMatch[2]! : '') || '40',
            10
         ),
         weekly_pay: weeklyPay || (fullWageMatch ? `$${fullWageMatch[3]}` : ''),
         status,
         other_compensation: otherCompText
      };
   });
}
