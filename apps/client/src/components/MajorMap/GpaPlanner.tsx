import {
   Badge,
   Box,
   Button,
   Field,
   Flex,
   HStack,
   IconButton,
   Input,
   NativeSelect,
   SimpleGrid,
   Text,
   VStack,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import {
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from 'recharts'
import { Stat } from '@/components/ui/stat'
import { CHART_COLORS, chartTick } from '@/lib/chartTheme'
import {
   addWhatIfCourse,
   buildGpaSeries,
   clearWhatIf,
   collectProgramCourses,
   defaultCredits,
   formatGpa,
   LETTER_GRADES,
   removeWhatIfCourse,
   setCourseGrade,
   setCourseStatus,
   setTargetGpa,
   summarizeProgressGpa,
   targetPlanHint,
   updateWhatIfCourse,
   useMajorMapProgress,
   type CourseRef,
   type LetterGrade,
   type MajorProgram,
} from '@/lib/major-map'

const gpaGradeOptions = LETTER_GRADES.filter(g => g !== 'P' && g !== 'NP' && g !== 'W')

const gradeNativeItems = [
   { label: '—', value: '' },
   ...LETTER_GRADES.map(g => ({ label: g, value: g })),
]

const whatIfGradeItems = gpaGradeOptions.map(g => ({ label: g, value: g }))

function GpaChartTooltip({
   active,
   payload,
   label,
}: {
   active?: boolean
   payload?: Array<{ value?: number | null; name?: string; color?: string }>
   label?: string
}) {
   if (!active || !payload?.length) return null
   return (
      <Box bg='bg' borderWidth='thin' borderRadius='lg' px={3} py={2.5} shadow='md' minW='120px'>
         <Text fontSize='sm' color='fg.muted' mb={1}>
            {label}
         </Text>
         {payload.map((entry, i) =>
            entry.value == null ? null : (
               <Text key={i} fontSize='sm' fontWeight='semibold' color={entry.color}>
                  {entry.name}: {Number(entry.value).toFixed(2)}
               </Text>
            ),
         )}
      </Box>
   )
}

type GpaPlannerProps = {
   program: MajorProgram
}

export function GpaPlanner({ program }: GpaPlannerProps) {
   const progress = useMajorMapProgress(program.id)
   const catalogCourses = useMemo(() => collectProgramCourses(program), [program])
   const courseByCode = useMemo(() => {
      const map = new Map<string, CourseRef>()
      for (const c of catalogCourses) map.set(c.code.toUpperCase(), c)
      return map
   }, [catalogCourses])

   const summary = summarizeProgressGpa(progress)
   const creditsHint = targetPlanHint(progress, 'A')
   const series = useMemo(() => buildGpaSeries(progress), [progress])

   const chartData = useMemo(() => {
      return series.map(point => ({
         label: point.label,
         logged: point.kind === 'logged' ? point.gpa : null,
         projected: point.gpa,
         kind: point.kind,
      }))
   }, [series])

   const completed = Object.values(progress.courses)
      .filter(c => c.status === 'completed')
      .sort((a, b) => a.code.localeCompare(b.code))

   const [pickCode, setPickCode] = useState('')
   const [whatIfGrade, setWhatIfGrade] = useState<LetterGrade>('B')
   const [whatIfCredits, setWhatIfCredits] = useState('3')
   const [targetInput, setTargetInput] = useState(
      progress.targetGpa != null ? String(progress.targetGpa) : '',
   )

   const addHypothetical = () => {
      const course = courseByCode.get(pickCode.toUpperCase())
      if (!course) return
      const credits = Number(whatIfCredits)
      if (!Number.isFinite(credits) || credits <= 0) return
      addWhatIfCourse(program.id, {
         code: course.code,
         title: course.title,
         credits,
         projectedGrade: whatIfGrade,
         estimatedHoursPerWeek: null,
      })
      setPickCode('')
   }

   const applyTarget = () => {
      const n = Number(targetInput)
      if (!targetInput.trim()) {
         setTargetGpa(program.id, null)
         return
      }
      if (!Number.isFinite(n) || n < 0 || n > 4) return
      setTargetGpa(program.id, n)
   }

   const gpaDelta =
      summary.current.gpa != null && summary.projected.gpa != null
         ? summary.projected.gpa - summary.current.gpa
         : null

   return (
      <VStack align='stretch' gap={4} flex={1} minH={0} overflow='auto'>
         <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
            <Stat
               label='Current GPA'
               valueText={formatGpa(summary.current.gpa)}
               info='From logged courses with letter grades (P/NP/W excluded).'
            />
            <Stat
               label='Projected GPA'
               valueText={
                  <HStack gap={2} align='baseline'>
                     <Text as='span'>{formatGpa(summary.projected.gpa)}</Text>
                     {gpaDelta != null && gpaDelta !== 0 && (
                        <Badge
                           colorPalette={gpaDelta > 0 ? 'green' : 'red'}
                           variant='subtle'
                           size='sm'
                        >
                           {gpaDelta > 0 ? '+' : ''}
                           {gpaDelta.toFixed(2)}
                        </Badge>
                     )}
                  </HStack>
               }
               info='Current + what-if courses.'
            />
            <Stat
               label='Graded credits'
               valueText={String(summary.current.gradedCredits)}
            />
            <Stat
               label='What-if credits'
               valueText={String(summary.whatIfOnly.gradedCredits)}
            />
         </SimpleGrid>

         <Box borderWidth='thin' borderRadius='lg' bg='bg' p={4}>
            <Text fontWeight='semibold' mb={1}>
               GPA trajectory
            </Text>
            <Text fontSize='sm' color='fg.muted' mb={3}>
               Cumulative GPA as logged courses stack up; dashed line continues through what-ifs.
            </Text>
            {chartData.length === 0 ? (
               <Text fontSize='sm' color='fg.muted' py={8} textAlign='center'>
                  Log graded courses or add what-ifs to see the graph.
               </Text>
            ) : (
               <Box h='260px' w='full'>
                  <ResponsiveContainer width='100%' height='100%'>
                     <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid
                           strokeDasharray='3 3'
                           vertical={false}
                           stroke={CHART_COLORS.grid}
                        />
                        <XAxis
                           dataKey='label'
                           tick={chartTick(11)}
                           axisLine={false}
                           tickLine={false}
                           interval='preserveStartEnd'
                        />
                        <YAxis
                           domain={[0, 4]}
                           ticks={[0, 1, 2, 3, 4]}
                           tick={chartTick(11)}
                           axisLine={false}
                           tickLine={false}
                           width={32}
                        />
                        <Tooltip content={<GpaChartTooltip />} />
                        <Legend />
                        <Line
                           type='monotone'
                           dataKey='logged'
                           name='Logged'
                           stroke='var(--chakra-colors-teal-500)'
                           strokeWidth={2.5}
                           dot={{ r: 3 }}
                           connectNulls={false}
                        />
                        <Line
                           type='monotone'
                           dataKey='projected'
                           name='Projected'
                           stroke='var(--chakra-colors-orange-500)'
                           strokeWidth={2}
                           strokeDasharray='6 4'
                           dot={{ r: 3 }}
                           connectNulls
                        />
                     </LineChart>
                  </ResponsiveContainer>
               </Box>
            )}
         </Box>

         <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={4}
            align='stretch'
            flex={1}
            minH={0}
         >
            <Box flex={1} borderWidth='thin' borderRadius='lg' bg='bg' p={4} minW={0}>
               <HStack justify='space-between' mb={3}>
                  <Text fontWeight='semibold'>Logged courses</Text>
                  <Badge variant='subtle' colorPalette='teal'>
                     {completed.length}
                  </Badge>
               </HStack>
               <Text fontSize='sm' color='fg.muted' mb={3}>
                  Grades sync with Major Map tree. Adjust them here or when you mark courses taken.
               </Text>

               {completed.length === 0 ? (
                  <Text fontSize='sm' color='fg.muted'>
                     No courses logged yet — add taken courses above, or check them off on the Major
                     Map tree.
                  </Text>
               ) : (
                  <VStack align='stretch' gap={2} maxH='320px' overflow='auto'>
                     {completed.map(entry => {
                        const ref =
                           courseByCode.get(entry.code.toUpperCase()) ??
                           ({
                              code: entry.code,
                              title: entry.title,
                              credits: entry.credits ?? undefined,
                           } satisfies CourseRef)
                        return (
                           <HStack
                              key={entry.code}
                              justify='space-between'
                              gap={2}
                              py={1.5}
                              borderBottomWidth='thin'
                              borderColor='border.muted'
                           >
                              <VStack align='start' gap={0} minW={0} flex={1}>
                                 <Text fontSize='sm' fontWeight='medium' truncate>
                                    {entry.code}
                                 </Text>
                                 <Text fontSize='xs' color='fg.muted' truncate w='full'>
                                    {entry.title}
                                 </Text>
                              </VStack>
                              <Text fontSize='xs' color='fg.muted' flexShrink={0}>
                                 {entry.credits ?? defaultCredits(ref)} cr
                              </Text>
                              <NativeSelect.Root size='xs' width='4.5rem'>
                                 <NativeSelect.Field
                                    value={entry.grade ?? ''}
                                    onChange={e => {
                                       const v = e.currentTarget.value
                                       setCourseGrade(
                                          program.id,
                                          ref,
                                          v === '' ? null : (v as LetterGrade),
                                          program,
                                       )
                                    }}
                                 >
                                    {gradeNativeItems.map(opt => (
                                       <option key={opt.value || 'none'} value={opt.value}>
                                          {opt.label}
                                       </option>
                                    ))}
                                 </NativeSelect.Field>
                                 <NativeSelect.Indicator />
                              </NativeSelect.Root>
                              <IconButton
                                 aria-label='Remove course'
                                 size='xs'
                                 variant='ghost'
                                 onClick={() =>
                                    setCourseStatus(program.id, ref, 'planned', program)
                                 }
                              >
                                 <LuTrash2 />
                              </IconButton>
                           </HStack>
                        )
                     })}
                  </VStack>
               )}
            </Box>

            <Box flex={1} borderWidth='thin' borderRadius='lg' bg='bg' p={4} minW={0}>
               <HStack justify='space-between' mb={3}>
                  <Text fontWeight='semibold'>What-if planner</Text>
                  {progress.whatIf.length > 0 && (
                     <Button size='xs' variant='ghost' onClick={() => clearWhatIf(program.id)}>
                        Clear
                     </Button>
                  )}
               </HStack>
               <Text fontSize='sm' color='fg.muted' mb={3}>
                  Model hypothetical grades without changing your logged transcript.
               </Text>

               <VStack align='stretch' gap={3} mb={4}>
                  <Field.Root>
                     <Field.Label fontSize='xs'>Course from major</Field.Label>
                     <NativeSelect.Root size='sm'>
                        <NativeSelect.Field
                           value={pickCode}
                           onChange={e => {
                              const code = e.currentTarget.value
                              setPickCode(code)
                              const c = courseByCode.get(code.toUpperCase())
                              if (c?.credits != null) setWhatIfCredits(String(c.credits))
                           }}
                        >
                           <option value=''>Select a course…</option>
                           {catalogCourses.map(c => (
                              <option key={c.code} value={c.code}>
                                 {c.code} — {c.title}
                              </option>
                           ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                     </NativeSelect.Root>
                  </Field.Root>

                  <HStack gap={2} align='end'>
                     <Field.Root flex={1}>
                        <Field.Label fontSize='xs'>Credits</Field.Label>
                        <Input
                           size='sm'
                           type='number'
                           min={0}
                           step={0.5}
                           value={whatIfCredits}
                           onChange={e => setWhatIfCredits(e.currentTarget.value)}
                        />
                     </Field.Root>
                     <Field.Root flex={1}>
                        <Field.Label fontSize='xs'>Projected grade</Field.Label>
                        <NativeSelect.Root size='sm'>
                           <NativeSelect.Field
                              value={whatIfGrade}
                              onChange={e =>
                                 setWhatIfGrade(e.currentTarget.value as LetterGrade)
                              }
                           >
                              {whatIfGradeItems.map(opt => (
                                 <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                 </option>
                              ))}
                           </NativeSelect.Field>
                           <NativeSelect.Indicator />
                        </NativeSelect.Root>
                     </Field.Root>
                     <Button
                        size='sm'
                        colorPalette='teal'
                        onClick={addHypothetical}
                        disabled={!pickCode}
                     >
                        <LuPlus />
                        Add
                     </Button>
                  </HStack>
               </VStack>

               {progress.whatIf.length === 0 ? (
                  <Text fontSize='sm' color='fg.muted'>
                     No what-ifs yet. Add a course and projected grade to see GPA impact.
                  </Text>
               ) : (
                  <VStack align='stretch' gap={2}>
                     {progress.whatIf.map(w => (
                        <HStack
                           key={w.id}
                           justify='space-between'
                           gap={2}
                           py={1.5}
                           borderBottomWidth='thin'
                           borderColor='border.muted'
                        >
                           <VStack align='start' gap={0} minW={0} flex={1}>
                              <Text fontSize='sm' fontWeight='medium' truncate>
                                 {w.code}
                              </Text>
                              <Text fontSize='xs' color='fg.muted' truncate w='full'>
                                 {w.title}
                              </Text>
                           </VStack>
                           <Input
                              size='xs'
                              type='number'
                              width='3.5rem'
                              value={String(w.credits)}
                              onChange={e => {
                                 const n = Number(e.currentTarget.value)
                                 if (Number.isFinite(n) && n > 0) {
                                    updateWhatIfCourse(program.id, w.id, { credits: n })
                                 }
                              }}
                           />
                           <NativeSelect.Root size='xs' width='4.5rem'>
                              <NativeSelect.Field
                                 value={w.projectedGrade}
                                 onChange={e =>
                                    updateWhatIfCourse(program.id, w.id, {
                                       projectedGrade: e.currentTarget.value as LetterGrade,
                                    })
                                 }
                              >
                                 {whatIfGradeItems.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                       {opt.label}
                                    </option>
                                 ))}
                              </NativeSelect.Field>
                              <NativeSelect.Indicator />
                           </NativeSelect.Root>
                           <IconButton
                              aria-label='Remove what-if'
                              size='xs'
                              variant='ghost'
                              onClick={() => removeWhatIfCourse(program.id, w.id)}
                           >
                              <LuTrash2 />
                           </IconButton>
                        </HStack>
                     ))}
                  </VStack>
               )}
            </Box>
         </Flex>

         <Box borderWidth='thin' borderRadius='lg' bg='bg.subtle' p={4}>
            <Text fontWeight='semibold' mb={2}>
               Target GPA
            </Text>
            <HStack gap={2} align='end' flexWrap='wrap' mb={2}>
               <Field.Root maxW='8rem'>
                  <Field.Label fontSize='xs'>Goal (0–4.0)</Field.Label>
                  <Input
                     size='sm'
                     type='number'
                     min={0}
                     max={4}
                     step={0.01}
                     value={targetInput}
                     onChange={e => setTargetInput(e.currentTarget.value)}
                     onBlur={applyTarget}
                  />
               </Field.Root>
               <Button size='sm' variant='outline' onClick={applyTarget}>
                  Save target
               </Button>
            </HStack>
            {progress.targetGpa != null && creditsHint != null && (
               <Text fontSize='sm' color='fg.muted'>
                  To reach {progress.targetGpa.toFixed(2)} with all A&apos;s, you need about{' '}
                  <Text as='span' fontWeight='semibold' color='fg'>
                     {creditsHint.toFixed(1)} more graded credits
                  </Text>
                  .
               </Text>
            )}
            {progress.targetGpa != null && creditsHint == null && summary.current.gpa != null && (
               <Text fontSize='sm' color='fg.muted'>
                  {summary.current.gpa >= progress.targetGpa
                     ? 'You already meet this target on logged grades.'
                     : 'Target may be unreachable with A grades alone — check credit totals.'}
               </Text>
            )}
         </Box>

         <Box borderWidth='thin' borderRadius='lg' borderStyle='dashed' p={4}>
            <Text fontWeight='semibold' mb={1}>
               Difficulty / time estimate
            </Text>
            <Text fontSize='sm' color='fg.muted'>
               Coming soon: we&apos;ll scrape Rate My Professors to gauge class difficulty so the
               GPA guesser can suggest rough weekly hours. Fields are reserved on each course for
               that pipeline.
            </Text>
         </Box>
      </VStack>
   )
}
