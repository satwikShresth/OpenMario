import { Alert, Badge, Box, Flex, HStack, Icon, Splitter, Text, useBreakpointValue } from '@chakra-ui/react'
import { MonitorOffIcon } from '@/components/icons'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { Plan } from '@/components/Search/Plan'
import { ConflictsIndicator } from '@/components/Search/Plan/ConflictsIndicator'
import { CreditsIndicator } from '@/components/Search/Plan/CreditsIndicator'
import { Toaster } from '@/components/ui/toaster'
import { LoadingComponent } from '@/components/common'
import { useMigration } from '@/contexts/MigrationContext'
import { useLiveQuery, eq } from '@tanstack/react-db'
import { termsCollection } from '@/helpers/collections'
import { db } from '@/db'
import { terms } from '@/db/schema'
import { eq as drizzleEq } from 'drizzle-orm'
import { z } from 'zod'

const SPLITTER_KEY = 'plan-splitter-sizes'
const DEFAULT_SIZES = [40, 60]

const TERM_COLORS: Record<string, string> = {
  Fall: 'orange',
  Winter: 'cyan',
  Spring: 'green',
  Summer: 'yellow',
}

function getSavedSizes(): number[] {
  try {
    const raw = localStorage.getItem(SPLITTER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === 2) return parsed
    }
  } catch {}
  return DEFAULT_SIZES
}

export const Route = createFileRoute('/_search/courses/plan/$term_id')({
  beforeLoad: ({ params }) => ({
    getLabel: () =>
      db
        .select({ term: terms.term, year: terms.year })
        .from(terms)
        .where(drizzleEq(terms.id, params.term_id))
        .then(rows => (rows[0] ? `${rows[0].term} ${rows[0].year}` : 'Plan'))
        .catch(() => 'Plan'),
  }),
  validateSearch: z.object({
    search: z.string().optional(),
  }),
  component: PlanTermPage,
})

function PlanTermPage() {
  const { term_id } = Route.useParams()
  const { status } = useMigration()
  const [sizes, setSizes] = useState<number[]>(getSavedSizes)

  const orientation = useBreakpointValue<'horizontal' | 'vertical'>({
    base: 'vertical',
    lg: 'horizontal',
  })

  const { data: termRow } = useLiveQuery(
    q => q
      .from({ t: termsCollection })
      .select(({ t }) => ({ id: t.id, term: t.term, year: t.year }))
      .where(({ t }) => eq(t.id, term_id)),
    [term_id]
  )

  const currentTerm = termRow?.[0]?.term ?? ''
  const currentYear = termRow?.[0]?.year ?? 0
  const termColor = TERM_COLORS[currentTerm] ?? 'gray'

  if (status === 'pending' || status === 'initializing') {
    return (
      <LoadingComponent
        title="Initializing Database"
        message="Setting up your local database and running migrations. This may take a moment..."
        variant="processing"
      />
    )
  }

  if (status === 'error') {
    return <Text color="red.500">Failed to initialize database. Please refresh the page.</Text>
  }

  return (
    <>
      {/* Escape root box padding to use the full viewport height below the page header */}
      <Box
        mt={-6}
        mx={{ base: -4, md: -6 }}
        mb={{ base: '-72px', sm: -6 }}
        h="calc(100dvh - 52px)"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        {/* Toolbar */}
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
          <HStack gap={2.5}>
            <Badge
              colorPalette={termColor}
              variant="subtle"
              px={2.5}
              py={0.5}
              fontSize="sm"
              fontWeight="semibold"
            >
              {currentTerm} {currentYear}
            </Badge>
            <Text fontSize="xs" color="fg.subtle" hideBelow="md">
              Double-click the divider to reset layout
            </Text>
          </HStack>

          <HStack gap={2}>
            <ConflictsIndicator currentTerm={currentTerm} currentYear={currentYear} />
            <CreditsIndicator currentTerm={currentTerm} currentYear={currentYear} />
          </HStack>
        </Flex>

        {/* Minimum-width guard for horizontal layout */}
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

        {/* Resizable panels */}
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
            <Plan.Courses currentTerm={currentTerm} currentYear={currentYear} />
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
      <Outlet />
    </>
  )
}
