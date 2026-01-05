import { Container, Flex, HStack, Text, VStack, Button, Icon } from '@chakra-ui/react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Plan } from '@/components/Search/Plan'
import { ConflictsIndicator } from '@/components/Search/Plan/ConflictsIndicator'
import { CreditsIndicator } from '@/components/Search/Plan/CreditsIndicator'
import { Toaster } from '@/components/ui/toaster'
import { LoadingComponent } from '@/components/common'
import { useMigration } from '@/contexts/MigrationContext'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { z } from 'zod'

const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
const CURRENT_YEAR = 2025

const planSearchSchema = z.object({
  term: z.enum(['Fall', 'Winter', 'Spring', 'Summer']).default('Fall'),
  year: z.number().default(CURRENT_YEAR),
  search: z.string().optional(),
})

export const Route = createFileRoute('/_search/courses/plan')({
  validateSearch: planSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { term: currentTerm, year: currentYear, search: searchQuery } = Route.useSearch()
  const { status } = useMigration()

  const handlePrevTerm = () => {
    const currentIndex = TERMS.indexOf(currentTerm)
    const newIndex = (currentIndex - 1 + TERMS.length) % TERMS.length
    navigate({ search: { term: TERMS[newIndex], year: currentYear, search: searchQuery } })
  }

  const handleNextTerm = () => {
    const currentIndex = TERMS.indexOf(currentTerm)
    const newIndex = (currentIndex + 1) % TERMS.length
    navigate({ search: { term: TERMS[newIndex], year: currentYear, search: searchQuery } })
  }

  // Show loading if database is still initializing
  if (status === 'pending' || status === 'initializing') {
    return (
      <LoadingComponent
        title="Initializing Database"
        message="Setting up your local database and running migrations. This may take a moment..."
        variant="processing"
      />
    )
  }

  // Show error if migration failed
  if (status === 'error') {
    return (
      <Container maxW="container.xl" py={4}>
        <Text color="red.500">Failed to initialize database. Please refresh the page.</Text>
      </Container>
    )
  }

  return (
    <>
      <Container maxW="container.xl" py={4} h="calc(100vh - 80px)">
        <VStack gap={4} h="full" align="stretch">
          {/* Header with Term Switcher and Credits */}
          <HStack justify="space-between" align="center">
            {/* Term Switcher */}
            <HStack gap={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevTerm}
            >
              <Icon as={MdChevronLeft} />
            </Button>
              <Text fontSize="lg" fontWeight="bold" color="fg.emphasized" minW="180px" textAlign="center">
                {currentTerm} {currentYear}
              </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNextTerm}
            >
              <Icon as={MdChevronRight} />
            </Button>
            </HStack>

            {/* Conflicts and Credits Counter */}
            <HStack gap={2}>
            <ConflictsIndicator />
              <CreditsIndicator currentTerm={currentTerm} currentYear={currentYear} />
            </HStack>
          </HStack>

          <Flex direction={{ base: 'column', lg: 'row' }} gap={4} flex="1" minH="0">
            {/* Courses Search Box */}
            <Flex flex="1" minW={{ base: 'full', lg: '400px' }} h="full">
              <Plan.Courses />
            </Flex>

            {/* Calendar */}
            <Flex flex="1" minW={{ base: 'full', lg: '600px' }} h="full">
              <Plan.Calendar />
            </Flex>
          </Flex>
        </VStack>
        <Toaster />
        <Outlet />
      </Container>
    </>
  )
}
