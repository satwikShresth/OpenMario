import { Container, Flex, HStack, Text, VStack, Button, Icon } from '@chakra-ui/react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Plan } from '@/components/Search/Plan'
import { ConflictsIndicator } from '@/components/Search/Plan/ConflictsIndicator'
import { Toaster } from '@/components/ui/toaster'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { z } from 'zod'

const TERMS = ['Fall', 'Winter', 'Spring', 'Summer'] as const
const CURRENT_YEAR = 2025

const planSearchSchema = z.object({
  term: z.enum(['Fall', 'Winter', 'Spring', 'Summer']).default('Fall'),
  year: z.number().default(CURRENT_YEAR),
  search: z.string().optional(),
})

export const Route = createFileRoute('/_search/plan')({
  validateSearch: planSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { term: currentTerm, year: currentYear, search: searchQuery } = Route.useSearch()

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

  return (
    <Plan.Root index='sections'>
      <Container maxW="container.xl" py={4} h="calc(100vh - 80px)">
        <VStack gap={4} h="full" align="stretch">
          {/* Term Switcher with Conflict Indicator */}
          <HStack justify="center" gap={2}>
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevTerm}
            >
              <Icon as={MdChevronLeft} />
            </Button>
            <HStack gap={2}>
              <Text fontSize="lg" fontWeight="bold" color="fg.emphasized" minW="180px" textAlign="center">
                {currentTerm} {currentYear}
              </Text>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNextTerm}
            >
              <Icon as={MdChevronRight} />
            </Button>
            <ConflictsIndicator />
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
      </Container>
      <Toaster />
      <Outlet />
    </Plan.Root>
  )
}
