import {
   SquareMIcon, SquareMFilledIcon,
   SquareTIcon, SquareTFilledIcon,
   SquareWIcon, SquareWFilledIcon,
   SquareFIcon, SquareFFilledIcon,
} from '@/components/icons';

/** Drexel term codes: YYYYTT where TT ∈ {15=Fall, 25=Winter, 35=Spring, 45=Summer} */
const TERM_CODE_MAP: Record<string, string> = {
   '15': 'Fall',
   '25': 'Winter',
   '35': 'Spring',
   '45': 'Summer',
};

const TERM_TO_CODE: Record<string, string> = {
   Fall: '15',
   Winter: '25',
   Spring: '35',
   Summer: '45',
};

/** Parse a raw Drexel term id string (e.g. "202515") into { termName, year }. */
export function parseDrexelTerm(raw: string): { termName: string; year: number | null } {
   if (raw.length < 3) return { termName: '', year: null };
   const code = raw.slice(-2);
   const yearStr = raw.slice(0, -2);
   const year = Number.parseInt(yearStr, 10);
   const termName = TERM_CODE_MAP[code] ?? '';
   return { termName, year: Number.isFinite(year) && termName ? year : null };
}

/** Format a Drexel term id for display (e.g. "202515" → "Fall 2025"). */
export function formatDrexelTerm(raw: string): string {
   const { termName, year } = parseDrexelTerm(raw);
   return termName && year ? `${termName} ${year}` : raw;
}

/** Convert (termName, year) → Drexel numeric id e.g. "202515". */
export function toDrexelTermId(term: string, year: number): string {
   return `${year}${TERM_TO_CODE[term] ?? '15'}`;
}

export const weekItems = [
   {
      label: 'M',
      icon: SquareMIcon,
      filledIcon: SquareMFilledIcon,
      value: 'Monday'
   },
   {
      label: 'T',
      icon: SquareTIcon,
      filledIcon: SquareTFilledIcon,
      value: 'Tuesday'
   },
   {
      label: 'W',
      icon: SquareWIcon,
      filledIcon: SquareWFilledIcon,
      value: 'Wednesday'
   },
   {
      label: 'Th',
      icon: SquareTIcon,
      filledIcon: SquareTFilledIcon,
      value: 'Thursday'
   },
   {
      label: 'F',
      icon: SquareFIcon,
      filledIcon: SquareFFilledIcon,
      value: 'Friday'
   }
];

export function getRatingColor(rating: number, opacity: number = 1) {
   // Special case for 5.0 rating - must be exactly 5.0
   if (Math.abs(rating - 5.0) < 0.01) {
      return opacity < 1 ? 'yellow.600' : 'yellow.400';
   }
   // Scale: 1-2 (red), 2-3 (orange), 3-4 (yellow), 4-5 (green)
   if (rating >= 4) return opacity < 1 ? 'green' : 'green';
   if (rating >= 3) return opacity < 1 ? 'yellow' : 'yellow';
   if (rating >= 2) return opacity < 1 ? 'orange' : 'orange';
   return opacity < 1 ? 'red' : 'red';
}

export function getDifficultyColor(difficulty: number, opacity: number = 1) {
   // Scale: 1-2 (green/easy), 2-3 (blue/medium), 3-4 (purple/challenging), 4-5 (red/hard)
   if (difficulty >= 4) {
      return opacity < 1 ? 'red' : 'red';
   }
   if (difficulty >= 3) {
      return opacity < 1 ? 'purple' : 'purple';
   }
   if (difficulty >= 2) {
      return opacity < 1 ? 'blue' : 'blue';
   }
   return opacity < 1 ? 'green' : 'green';
}
