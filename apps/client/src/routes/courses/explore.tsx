import { createFileRoute } from '@tanstack/react-router';
import {
  Box,
  Button,
  createListCollection,
  Flex,
  Icon,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  RefinementSelect,
  Search,
  SearchBox,
  SortSelect,
  Stats,
} from '@/components/Search';
import { Courses } from '@/components/Courses';
import { useMobile } from '@/hooks';
import { FilterIcon, HeartFilledIcon, HeartIcon } from '@/components/icons';
import { Outlet } from '@tanstack/react-router';
import { Configure } from 'react-instantsearch';
import z from 'zod';
import { useLikedSections } from '@/db/stores/sections';

const sortBy = createListCollection({
  items: [
    { label: 'Most Relevant', value: 'sections' },
    {
      label: 'Course Number (Low to High)',
      value: 'sections:course_number:asc',
    },
    {
      label: 'Course Number (High to Low)',
      value: 'sections:course_number:desc',
    },
    {
      label: 'Credits (Highest)',
      value: 'sections:credits:desc',
    },
    {
      label: 'Credits (Lowest)',
      value: 'sections:credits:asc',
    },
    {
      label: 'Start Time (Earliest)',
      value: 'sections:start_time:asc',
    },
    {
      label: 'Start Time (Latest)',
      value: 'sections:start_time:desc',
    },
    {
      label: 'Instructor Rating (Highest)',
      value: 'sections:instructors.avg_rating:desc',
    },
  ],
});

export const Route = createFileRoute('/courses/explore')({
  beforeLoad: () => ({ getLabel: () => 'Explore Courses' }),
  validateSearch: z.object({
    showFavorites: z.catch(z.optional(z.boolean()), false)
  }),
  component: () => {
    const { open: isFilterOpen, onOpen: openFilter, onClose: closeFilter } = useDisclosure();
    const isMobile = useMobile();

    return (
      <Courses.Root>
        <Courses.PageHeader title='Explore Courses' />
        <Flex
          gap={{ base: 3, md: 4 }}
          direction='column'
          minHeight='0'
          width='full'
          flex='1'
        >
          {/* Search Header */}
          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            gap={{ base: 3, sm: 4, md: 5 }}
            width='full'
          >
            <Box flex='1' minWidth='0'>
              <SearchBox />
            </Box>
            <Box flexShrink={0} width={{ base: 'full', sm: 'auto' }}>
              <RefinementSelect attribute='term' size={{ base: 'md', md: 'lg' }} />
            </Box>
          </Flex>

          {/* Mobile Filter and Sort Controls */}
          {isMobile && (
            <Flex direction='row' width='full' gap={3} align='center' flexWrap='wrap'>
              <Button onClick={openFilter} variant='outline' size='md'>
                <Icon as={FilterIcon} />
                <Text>Filters</Text>
              </Button>
              <ToggleFav />
              <Box flex='1' minW={0} />
              <SortSelect sortBy={sortBy} />
            </Flex>
          )}

          {/* Main Content Area */}
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            flex='1'
            width='full'
            minHeight='0'
            gap={{ base: 4, md: 5 }}
            align='stretch'
          >
            {!isMobile && (
              <Box width='280px' flexShrink={0}>
                <Search.Courses.Filters open={isFilterOpen} onClose={closeFilter} />
              </Box>
            )}

            <Flex direction='column' flex='1' minWidth='0' gap={{ base: 3, md: 4 }}>
              {!isMobile && (
                <Flex justify='space-between' align='center' gap={3}>
                  <Box flex='1' minWidth='0'>
                    <Stats />
                  </Box>
                  <Box flexShrink={0}>
                    <ToggleFav />
                  </Box>
                  <Box flexShrink={0}>
                    <SortSelect sortBy={sortBy} />
                  </Box>
                </Flex>
              )}

              {isMobile && <Stats />}
              <Box flex='1' minHeight='0' overflowY='auto'>
                <Configure hitsPerPage={10} />
                <Search.Courses.Cards />
              </Box>
            </Flex>
          </Flex>

          <Outlet />
          {isMobile && (
            <Search.Courses.Filters
              open={isFilterOpen}
              onClose={closeFilter}
            />
          )}
        </Flex>
      </Courses.Root>
    );
  },
});

const ToggleFav = () => {
  const navigate = Route.useNavigate();
  const showFavorites = Route.useSearch({ select: (s) => s?.showFavorites === true });

  const likedSections = useLikedSections()

  const favoritesFilter = likedSections.map(({ crn }) => `crn = ${crn}`).join(' OR ');
  const handleToggle = (checked: boolean) => {
    navigate({
      search: (prev) => ({
        ...prev,
        showFavorites: checked ? true : undefined,
      }),
    });
  };

  return (
    <>
      {showFavorites && likedSections?.length > 0 && <Configure filters={favoritesFilter} page={0} />}
      <Button
        variant={showFavorites ? 'solid' : 'outline'}
        colorPalette='pink'
        size='sm'
        disabled={likedSections.length < 1}
        onClick={() => handleToggle(!showFavorites)}
        flexShrink={0}
      >
        <Icon as={showFavorites ? HeartFilledIcon : HeartIcon} />
        Liked ({likedSections.length})
      </Button>
    </>
  );
};
