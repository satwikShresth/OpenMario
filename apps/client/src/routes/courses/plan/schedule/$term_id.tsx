import {
  Alert,
  Box,
  Button,
  createListCollection,
  Flex,
  HStack,
  Icon,
  Portal,
  Select,
  Splitter,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { MonitorOffIcon } from '@/components/icons'
import { createFileRoute, Link, Outlet, useMatch, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Plan } from '@/components/Search/Plan'
import { ConflictsIndicator } from '@/components/Search/Plan/ConflictsIndicator'
import { CreditsIndicator } from '@/components/Search/Plan/CreditsIndicator'
import { Toaster } from '@/components/ui/toaster'
import { db } from '@/db/dexie'
import { upsertTerm } from '@/db/mutations'
import { useTermById } from '@/db/stores/terms'
import { z } from 'zod'

const SPLITTER_KEY = 'plan-splitter-sizes'
const DEFAULT_SIZES = [38, 62]
const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
type TermName = (typeof TERMS)[number]

function getSavedSizes(): number[] {
  try {
    const raw = localStorage.getItem(SPLITTER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === 2) return parsed
    }
  } catch { }
  return DEFAULT_SIZES
}

function yearOptions(center: number) {
  const base = center > 0 ? center : new Date().getFullYear()
  return Array.from({ length: 7 }, (_, i) => base - 3 + i)
}

export const Route = createFileRoute('/courses/plan/schedule/$term_id')({
  beforeLoad: ({ params }) => ({
    getLabel: () =>
      db.terms.get(params.term_id)
        .then(row => row ? `${row.term} ${row.year}` : 'Schedule')
        .catch(() => 'Schedule'),
  }),
  validateSearch: z.object({
    search: z.string().optional(),
  }),
  component: PlanTermPage,
})

function QuarterSwitcher({
  term,
  year,
}: {
  term: TermName
  year: number
}) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const termCollection = useMemo(
    () => createListCollection({ items: TERMS.map(t => ({ label: t, value: t })) }),
    [],
  )
  const yearCollection = useMemo(
    () =>
      createListCollection({
        items: yearOptions(year).map(y => ({ label: String(y), value: String(y) })),
      }),
    [year],
  )

  const switchTo = async (nextTerm: TermName, nextYear: number) => {
    if (nextTerm === term && nextYear === year) return
    setBusy(true)
    try {
      const termId = await upsertTerm(nextTerm, nextYear)
      await navigate({
        to: '/courses/plan/schedule/$term_id',
        params: { term_id: termId },
        search: { search: undefined },
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <HStack gap={2}>
      <Select.Root
        size="xs"
        width="7.5rem"
        collection={termCollection}
        value={[term]}
        disabled={busy}
        onValueChange={({ value }) => {
          const next = value[0] as TermName | undefined
          if (next) void switchTo(next, year)
        }}
        positioning={{ sameWidth: true }}
      >
        <Select.HiddenSelect aria-label="Term" />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Term" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {termCollection.items.map(item => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Select.Root
        size="xs"
        width="5.5rem"
        collection={yearCollection}
        value={[String(year)]}
        disabled={busy}
        onValueChange={({ value }) => {
          const next = value[0]
          if (next) void switchTo(term, Number(next))
        }}
        positioning={{ sameWidth: true }}
      >
        <Select.HiddenSelect aria-label="Year" />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Year" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {yearCollection.items.map(item => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </HStack>
  )
}

function PlanTermPage() {
  const { term_id } = Route.useParams()
  const { search: searchPrefill } = Route.useSearch()
  const [sizes, setSizes] = useState<number[]>(getSavedSizes)
  const isCourseDetail = useMatch({ from: '/courses/plan/schedule/$term_id/$course_id', shouldThrow: false })

  const orientation = useBreakpointValue<'horizontal' | 'vertical'>({
    base: 'vertical',
    lg: 'horizontal',
  })

  const termRow = useTermById(term_id)

  if (isCourseDetail) {
    return <Outlet />
  }

  const currentTerm = (termRow?.term as TermName) ?? 'Fall'
  const currentYear = termRow?.year ?? new Date().getFullYear()

  return (
    <>
      <Box
        flex="1"
        minH={0}
        h="full"
        w="full"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <Flex
          align="center"
          justify="space-between"
          px={{ base: 4, md: 6 }}
          py={2.5}
          borderBottomWidth="1px"
          borderColor="border.subtle"
          bg="bg"
          flexShrink={0}
          gap={3}
        >
          <HStack gap={2.5} flexWrap="wrap">
            <Button asChild size="xs" variant="ghost">
              <Link to="/courses/plan/schedule">← Quarters</Link>
            </Button>
            <QuarterSwitcher term={currentTerm} year={currentYear} />
            <Text fontSize="xs" color="fg.subtle" hideBelow="md">
              Pick sections for this term
            </Text>
          </HStack>

          <HStack gap={2}>
            <ConflictsIndicator currentTerm={currentTerm} currentYear={currentYear} />
            <CreditsIndicator currentTerm={currentTerm} currentYear={currentYear} />
          </HStack>
        </Flex>

        {orientation === 'horizontal' && (
          <Alert.Root
            status="warning"
            size="sm"
            flexShrink={0}
            borderRadius="md"
            display={{ base: 'none', sm: 'flex', lg: 'none' }}
          >
            <Alert.Indicator>
              <Icon as={MonitorOffIcon} />
            </Alert.Indicator>
            <Alert.Description fontSize="xs">
              The plan editor works best at 1024 px or wider. Try expanding your window or using a larger screen.
            </Alert.Description>
          </Alert.Root>
        )}

        <Splitter.Root
          panels={[
            { id: 'courses', minSize: 28, maxSize: 55 },
            { id: 'calendar', minSize: 32 },
          ]}
          size={sizes}
          orientation={orientation}
          onResize={e => setSizes(e.size)}
          onResizeEnd={e => {
            setSizes(e.size)
            localStorage.setItem(SPLITTER_KEY, JSON.stringify(e.size))
          }}
          flex="1"
          minH="0"
          overflow="hidden"
          gap={2}
        >
          <Splitter.Panel
            id="courses"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Plan.Courses
              currentTerm={currentTerm}
              currentYear={currentYear}
              initialSearch={searchPrefill}
            />
          </Splitter.Panel>

          <Splitter.Context>
            {ctx => (
              <Splitter.ResizeTrigger
                id="courses:calendar"
                aria-label="Resize panels"
                onDoubleClick={() => {
                  setSizes(DEFAULT_SIZES)
                  localStorage.removeItem(SPLITTER_KEY)
                  ctx.resetSizes()
                }}
              />
            )}
          </Splitter.Context>

          <Splitter.Panel
            id="calendar"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Plan.Calendar currentTerm={currentTerm} currentYear={currentYear} />
          </Splitter.Panel>
        </Splitter.Root>
      </Box>

      <Toaster />
    </>
  )
}
