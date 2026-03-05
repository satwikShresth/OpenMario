/**
 * Two sections:
 *  1. Offering history  — Year × Term table showing ✓ / –
 *  2. Instructor roster — one row per (instructor, term), with time, CRN, and RMP stats
 */
import {
   Badge,
   Box,
   For,
   HStack,
   Separator,
   Skeleton,
   Table,
   Text,
   VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/helpers';
import { Tag } from '@/components/ui';
import { getDifficultyColor, getRatingColor } from './helpers';
import type { Instructor } from '@openmario/contracts';

type Props = { course_id: string };

// ─── term helpers ────────────────────────────────────────────────────────────

const TERM_SUFFIX_LABEL: Record<string, string> = {
   '15': 'Fall',
   '25': 'Winter',
   '35': 'Spring',
   '45': 'Summer',
};
const TERM_ORDER = ['15', '25', '35', '45'];

function parseTerm(code: string | number): { year: string; suffix: string; label: string } {
   const s = String(code);
   const year = s.slice(0, 4);
   const suffix = s.slice(4);
   return { year, suffix, label: TERM_SUFFIX_LABEL[suffix] ?? suffix };
}

function formatTime(t: string | null | undefined): string {
   if (!t) return '—';
   const [h, m] = t.split(':');
   const hour = parseInt(h!, 10);
   const ampm = hour >= 12 ? 'PM' : 'AM';
   const h12 = hour % 12 || 12;
   return `${h12}:${m} ${ampm}`;
}

// ─── types ───────────────────────────────────────────────────────────────────

type AvailRow = {
   term: string;
   crn: string;
   instructor: Instructor | null;
   start_time?: string | null;
   end_time?: string | null;
};

type YearGroup = Record<string, AvailRow[]>; // suffix → rows

// ─── component ───────────────────────────────────────────────────────────────

export default function CourseInstructorHistory({ course_id }: Props) {
   const { data, isLoading } = useQuery(
      orpc.course.availabilities.queryOptions({ input: { params: { course_id } } })
   );

   if (isLoading) {
      return (
         <VStack align='stretch' gap={3}>
            <Skeleton height='6' width='40%' />
            <Skeleton height='32' />
            <Skeleton height='6' width='40%' />
            <Skeleton height='48' />
         </VStack>
      );
   }

   const rows: AvailRow[] = data ?? [];
   if (rows.length === 0) return null;

   // ── build year groups ──────────────────────────────────────────────────
   const yearMap = new Map<string, YearGroup>();

   for (const row of rows) {
      const { year, suffix } = parseTerm(row.term);
      if (!yearMap.has(year)) {
         yearMap.set(year, { '15': [], '25': [], '35': [], '45': [] });
      }
      yearMap.get(year)![suffix]!.push(row);
   }

   const sortedYears = [...yearMap.keys()].sort();

   // ── build instructor rows (deduplicated by instructor+term) ───────────
   type InstructorRow = {
      instructor: Instructor | null;
      termLabel: string;
      year: string;
      termSuffix: string;
      crns: string[];
      start_time: string | null;
      end_time: string | null;
   };

   const instrRows: InstructorRow[] = [];
   const seen = new Set<string>();

   for (const row of [...rows].sort((a, b) => String(b.term).localeCompare(String(a.term)))) {
      const { year, suffix, label } = parseTerm(row.term);
      const instrName = row.instructor?.name ?? 'TBA';
      const key = `${year}-${suffix}-${instrName}`;
      if (seen.has(key)) {
         const existing = instrRows.find(
            r => r.year === year && r.termSuffix === suffix && (r.instructor?.name ?? 'TBA') === instrName
         );
         existing?.crns.push(row.crn);
         continue;
      }
      seen.add(key);
      instrRows.push({
         instructor: row.instructor,
         termLabel: label,
         year,
         termSuffix: suffix,
         crns: [row.crn],
         start_time: (row as any).start_time ?? null,
         end_time: (row as any).end_time ?? null,
      });
   }

   return (
      <VStack align='stretch' gap={6}>

         {/* ── 1. Offering History ── */}
         <Box>
            <Text fontSize='md' fontWeight='semibold' mb={3}>Offering History</Text>
            <Table.Root size='sm' showColumnBorder variant='outline'>
               <Table.Header>
                  <Table.Row>
                     <Table.ColumnHeader>Year</Table.ColumnHeader>
                     <For each={TERM_ORDER}>
                        {(s: string) => (
                           <Table.ColumnHeader key={s} textAlign='center' width='22%'>
                              {TERM_SUFFIX_LABEL[s]}
                           </Table.ColumnHeader>
                        )}
                     </For>
                  </Table.Row>
               </Table.Header>
               <Table.Body>
                  <For each={sortedYears}>
                     {(year: string) => {
                        const group = yearMap.get(year)!;
                        return (
                           <Table.Row key={year}>
                              <Table.Cell fontWeight='medium'>{year}</Table.Cell>
                              <For each={TERM_ORDER}>
                                 {(s: string) => (
                                    <Table.Cell key={s} textAlign='center'>
                                       {group[s]!.length > 0
                                          ? <Text color='green.500' fontWeight='bold'>✓</Text>
                                          : <Text color='gray.300'>–</Text>}
                                    </Table.Cell>
                                 )}
                              </For>
                           </Table.Row>
                        );
                     }}
                  </For>
               </Table.Body>
            </Table.Root>
         </Box>

         <Separator />

         {/* ── 2. Instructor / Section Breakdown ── */}
         <Box>
            <Text fontSize='md' fontWeight='semibold' mb={3}>Instructors by Term</Text>
            <Table.Root size='sm' variant='outline' showColumnBorder>
               <Table.Header>
                  <Table.Row>
                     <Table.ColumnHeader>Instructor</Table.ColumnHeader>
                     <Table.ColumnHeader>Term</Table.ColumnHeader>
                     <Table.ColumnHeader>Time</Table.ColumnHeader>
                     <Table.ColumnHeader>CRN(s)</Table.ColumnHeader>
                     <Table.ColumnHeader>Rating</Table.ColumnHeader>
                     <Table.ColumnHeader>Difficulty</Table.ColumnHeader>
                  </Table.Row>
               </Table.Header>
               <Table.Body>
                  <For each={instrRows}>
                     {(r: InstructorRow) => (
                        <Table.Row key={`${r.year}-${r.termSuffix}-${r.instructor?.id ?? 'tba'}`}>
                           <Table.Cell fontWeight='medium' maxW='36' truncate>
                              {r.instructor?.name ?? (
                                 <Text color='gray.400' fontStyle='italic'>TBA</Text>
                              )}
                           </Table.Cell>
                           <Table.Cell whiteSpace='nowrap'>
                              <HStack gap={1}>
                                 <Badge size='sm' variant='subtle'>{r.termLabel}</Badge>
                                 <Text fontSize='xs' color='gray.500'>{r.year}</Text>
                              </HStack>
                           </Table.Cell>
                           <Table.Cell whiteSpace='nowrap' fontSize='xs' color='gray.600'>
                              {r.start_time
                                 ? `${formatTime(r.start_time)} – ${formatTime(r.end_time)}`
                                 : '—'}
                           </Table.Cell>
                           <Table.Cell fontSize='xs' color='gray.600'>
                              {r.crns.join(', ')}
                           </Table.Cell>
                           <Table.Cell>
                              {r.instructor?.avg_rating != null
                                 ? (
                                    <Tag
                                       size='sm'
                                       colorPalette={getRatingColor(r.instructor.avg_rating)}
                                    >
                                       {r.instructor.avg_rating.toFixed(1)}
                                       {r.instructor.num_ratings != null && (
                                          <Text as='span' color='fg.muted' ml={1} fontSize='xs'>
                                             ({r.instructor.num_ratings})
                                          </Text>
                                       )}
                                    </Tag>
                                 )
                                 : <Text color='gray.300' fontSize='xs'>—</Text>}
                           </Table.Cell>
                           <Table.Cell>
                              {r.instructor?.avg_difficulty != null
                                 ? (
                                    <Tag
                                       size='sm'
                                       colorPalette={getDifficultyColor(r.instructor.avg_difficulty)}
                                    >
                                       {r.instructor.avg_difficulty.toFixed(1)}
                                    </Tag>
                                 )
                                 : <Text color='gray.300' fontSize='xs'>—</Text>}
                           </Table.Cell>
                        </Table.Row>
                     )}
                  </For>
               </Table.Body>
            </Table.Root>
         </Box>
      </VStack>
   );
}
