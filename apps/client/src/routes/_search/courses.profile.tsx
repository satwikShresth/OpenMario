import { createFileRoute, useNavigate, Outlet } from '@tanstack/react-router';
import { useLiveQuery, eq } from '@tanstack/react-db';
import {
  sectionsCollection,
  coursesCollection,
  planEventsCollection,
  termsCollection
} from '@/helpers/collections';
import {
  Table,
  Checkbox,
  ActionBar,
  Portal,
  Button,
  Kbd,
  VStack,
  Heading,
  Badge,
  HStack,
  Popover,
  Input,
  Text,
  Spinner,
  Icon
} from '@chakra-ui/react';
import { useState, useMemo, useEffectEvent, useEffect } from 'react';
import { MdAdd, MdCheckCircle, MdLightbulb } from 'react-icons/md';
import { useInstantSearch, Configure } from 'react-instantsearch';
import { toaster } from '@/components/ui/toaster';
import { useSearchContext } from '@/components/Search';

export const Route = createFileRoute('/_search/courses/profile')({
  component: RouteComponent
});

type CombinedCourseData = {
  courseId: string;
  courseName: string;
  courseNumber: string;
  credits: number | null;
  status: 'considering' | 'planned' | 'liked' | 'taken';
  crns: string[];
  plannedTerm: string;
};

// Course search component
function CourseSearchPopover({
  onAddCourse,
  existingCourseIds
}: {
  onAddCourse: (course: any, status: 'taken' | 'considering') => void;
  existingCourseIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { results, status } = useInstantSearch();
  const { setMeiliSearchParams } = useSearchContext();

  const onAttach = useEffectEvent(() => setMeiliSearchParams({
    distinct: 'course_id'
  }))

  const onDettach = useEffectEvent(() => setMeiliSearchParams({
    distinct: undefined
  }))

  useEffect(() => {
    onAttach();
    return () => onDettach()
  })



  const courses = results.__isArtificial ? [] : results.hits;

  // Build filter string to exclude existing courses
  const filterString = useMemo(() => {
    if (existingCourseIds.length === 0) return 'distinct="course_id"';

    // Create NOT filters for each existing course (using 'course' field, not 'id')
    const notFilters = existingCourseIds.map(id => `course_id != "${id}"`).join(' AND ');
    return notFilters;
  }, [existingCourseIds]);

  const handleAddCourse = (course: any, status: 'taken' | 'considering') => {
    onAddCourse(course, status);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Popover.Trigger asChild>
        <Button colorPalette="blue" size="md">
          <Icon as={MdAdd} />
          Add Course
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content minW="500px" maxH="600px">
            <Popover.Arrow />
            <Popover.Header>
              <Text fontWeight="semibold">Add Course</Text>
            </Popover.Header>
            <Popover.Body>
              <VStack align="stretch" gap={3}>
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {status === 'loading' && (
                  <HStack justify="center" p={4}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="fg.muted">Searching...</Text>
                  </HStack>
                )}
                {status === 'idle' && courses.length === 0 && searchQuery && (
                  <Text fontSize="sm" color="fg.muted" textAlign="center" p={4}>
                    No courses found
                  </Text>
                )}
                {courses.length > 0 && (
                  <VStack align="stretch" gap={2} maxH="400px" overflowY="auto">
                    {courses.map((course: any) => (
                      <HStack
                        key={course.id}
                        justify="space-between"
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        _hover={{ bg: 'bg.muted' }}
                      >
                        <VStack align="stretch" gap={1} flex={1}>
                          <Text fontSize="sm" fontWeight="bold">
                            {course.course}
                          </Text>
                          <Text fontSize="xs" color="fg.muted" lineClamp={1}>
                            {course.title}
                          </Text>
                          {course.credits && (
                            <Badge size="xs" width="fit-content">
                              {course.credits} Credits
                            </Badge>
                          )}
                        </VStack>
                        <HStack gap={1}>
                          <Button
                            size="xs"
                            colorPalette="green"
                            variant="outline"
                            onClick={() => handleAddCourse(course, 'taken')}
                          >
                            <Icon as={MdCheckCircle} />
                            Taken
                          </Button>
                          <Button
                            size="xs"
                            colorPalette="gray"
                            variant="outline"
                            onClick={() => handleAddCourse(course, 'considering')}
                          >
                            <Icon as={MdLightbulb} />
                            Consider
                          </Button>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Popover.Body>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
      <Configure
        hitsPerPage={20}
        query={searchQuery}
        filters={filterString}
      />
    </Popover.Root>
  );
}

function RouteComponent() {
  const [selection, setSelection] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch all courses
  const { data: allCourses } = useLiveQuery(
    q => q.from({ courses: coursesCollection }).select(({ courses }) => ({ ...courses })),
    []
  );

  // Fetch all sections with their course data
  const { data: allSections } = useLiveQuery(
    q =>
      q
        .from({ sections: sectionsCollection })
        .leftJoin({ courses: coursesCollection }, ({ sections, courses }) =>
          eq(sections.courseId, courses.id)
        )
        .select(({ sections }) => ({
          crn: sections.crn,
          term: sections.termId,
          courseId: sections.courseId,
          liked: sections.liked
        })),
    []
  );

  // Fetch all plan events
  const { data: allPlanEvents } = useLiveQuery(
    q =>
      q
        .from({ events: planEventsCollection })
        .innerJoin({ terms: termsCollection }, ({ events, terms }) =>
          eq(events.termId, terms.id)
        )
        .select(({ events, terms }) => ({
          id: events.id,
          crn: events.crn,
          termName: terms.term,
          termYear: terms.year
        })),
    []
  );

  // Combine data
  const combinedData: CombinedCourseData[] = [];

  if (allCourses) {
    allCourses.forEach((course) => {
      // Find all sections for this course
      const courseSections = allSections?.filter((s) => s.courseId === course.id) || [];
      const crns = courseSections.map((s) => s.crn);

      // Check if any section is liked
      const hasLikedSection = courseSections.some((s: any) => s.liked);

      // Find all planned terms for this course's CRNs (deduplicated)
      const plannedTerm = termsCollection.get(courseSections![0]!.term!);

      // Determine status
      let status: 'considering' | 'planned' | 'liked' | 'taken';
      if (course.completed) {
        status = 'taken';
      } else if (hasLikedSection) {
        status = 'liked';
      } else if (courseSections.length > 0) {
        status = 'planned';
      } else {
        status = 'considering';
      }

      combinedData.push({
        courseId: course.id,
        courseName: course.title,
        courseNumber: course.course,
        credits: course.credits,
        status,
        crns,
        plannedTerm: `${plannedTerm?.term} ${plannedTerm?.year}`
      });
    });
  }

  const hasSelection = selection.length > 0;
  const indeterminate = hasSelection && selection.length < combinedData.length;

  // Calculate taken credits
  const takenCredits = useMemo(() => {
    return combinedData
      .filter(item => item.status === 'taken' && item.credits)
      .reduce((sum, item) => sum + (item.credits || 0), 0);
  }, [combinedData]);

  // Calculate planned + considering + liked credits (all non-taken)
  const activeCredits = useMemo(() => {
    return combinedData
      .filter(item => item.status !== 'taken' && item.credits)
      .reduce((sum, item) => sum + (item.credits || 0), 0);
  }, [combinedData]);

  // Check if all selected items are liked
  const selectedItems = combinedData.filter(item => selection.includes(item.courseId));
  const allLiked = selectedItems.every(item => item.status === 'liked');

  // Bulk actions
  const handleBulkToggleLike = () => {
    // If all are liked, unlike all. Otherwise, like all.
    const shouldLike = !allLiked;

    selection.forEach(courseId => {
      // Get all CRNs for this course
      const courseData = combinedData.find(item => item.courseId === courseId);
      if (!courseData) return;

      courseData.crns.forEach(crn => {
        const section = sectionsCollection.get(crn);
        if (section) {
          sectionsCollection.update(crn, (draft) => {
            draft.liked = shouldLike;
            draft.updatedAt = new Date();
          });
        }
      });
    });
    setSelection([]);
  };

  const handleBulkDelete = () => {
    selection.forEach(courseId => {
      // Get all CRNs for this course
      const courseData = combinedData.find(item => item.courseId === courseId);
      if (!courseData) return;

      courseData.crns.forEach(crn => {
        // Delete all plan events for this CRN
        const eventsToDelete = allPlanEvents?.filter((e: any) => e.crn === crn) || [];
        eventsToDelete.forEach((event: any) => {
          if (event.id) {
            planEventsCollection.delete(event.id);
          } else {
            console.error('Event missing id:', event);
          }
        });

        // Delete section
        const section = sectionsCollection.get(crn);
        if (section) {
          sectionsCollection.delete(crn);
        }
      });

      // Always delete the course from coursesCollection
      const course = coursesCollection.get(courseId);
      if (course) {
        coursesCollection.delete(courseId);
      }
    });
    setSelection([]);
  };

  const handleBulkMarkAsTaken = () => {
    selection.forEach(courseId => {
      const course = coursesCollection.get(courseId);
      if (course) {
        coursesCollection.update(courseId, (draft) => {
          draft.completed = true;
          draft.updatedAt = new Date();
        });
      }
    });

    toaster.create({
      title: 'Marked as Taken',
      description: `${selection.length} course${selection.length > 1 ? 's' : ''} marked as taken`,
      type: 'success',
    });

    setSelection([]);
  };

  const handleBulkDeleteSections = () => {
    selection.forEach(courseId => {
      // Get all CRNs for this course
      const courseData = combinedData.find(item => item.courseId === courseId);
      if (!courseData) return;

      courseData.crns.forEach(crn => {
        // Delete all plan events for this CRN
        const eventsToDelete = allPlanEvents?.filter((e: any) => e.crn === crn) || [];
        eventsToDelete.forEach((event: any) => {
          if (event.id) {
            planEventsCollection.delete(event.id);
          }
        });

        // Delete section
        const section = sectionsCollection.get(crn);
        if (section) {
          sectionsCollection.delete(crn);
        }
      });

      // Keep the course in coursesCollection but mark as not completed
      const course = coursesCollection.get(courseId);
      if (course) {
        coursesCollection.update(courseId, (draft) => {
          draft.completed = false;
          draft.updatedAt = new Date();
        });
      }
    });

    toaster.create({
      title: 'Sections Deleted',
      description: `Sections removed. ${selection.length} course${selection.length > 1 ? 's' : ''} now marked as considering.`,
      type: 'success',
    });

    setSelection([]);
  };

  const handleAddCourse = (course: any, status: 'taken' | 'considering') => {
    try {
      const courseId = course.course_id || course.id;

      // Check if course already exists
      const existingCourse = coursesCollection.get(courseId);
      if (existingCourse) {
        toaster.create({
          title: 'Course Already Added',
          description: `${course.course} is already in your profile`,
          type: 'warning',
        });
        return;
      }

      // Add course
      coursesCollection.insert({
        id: courseId,
        course: course.course,
        title: course.title,
        completed: status === 'taken',
        credits: course.credits || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toaster.create({
        title: 'Course Added',
        description: `${course.course} has been added as ${status === 'taken' ? 'taken' : 'considering'}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding course:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to add course',
        type: 'error',
      });
    }
  };

  // Get list of existing course IDs (map from course.id to course_id for filtering)
  const existingCourseIds = useMemo(() => {
    return combinedData.map(item => item.courseId);
  }, [combinedData]);

  const handleRowClick = (courseId: string) => {
    navigate({
      to: '/courses/profile/$course_id',
      params: { course_id: courseId }
    });
  };

  return (
    <>
      <VStack align="stretch" gap={6} p={6}>
        <HStack justify="space-between" align="center">
          <Heading size="xl">Course Profile</Heading>
          <HStack gap={3}>
            <CourseSearchPopover onAddCourse={handleAddCourse} existingCourseIds={existingCourseIds} />
            <Badge
              size="lg"
              colorPalette="green"
              px={4}
              py={2}
              fontSize="md"
              fontWeight="bold"
            >
              {takenCredits} Taken
            </Badge>
            <Badge
              size="lg"
              colorPalette="blue"
              px={4}
              py={2}
              fontSize="md"
              fontWeight="bold"
            >
              {activeCredits} Active
            </Badge>
          </HStack>
        </HStack>

        <Table.Root size="sm" variant="outline" interactive>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader w="6" onClick={(e) => e.stopPropagation()}>
                <Checkbox.Root
                  size="sm"
                  mt="0.5"
                  aria-label="Select all rows"
                  checked={indeterminate ? 'indeterminate' : selection.length > 0}
                  onCheckedChange={(changes) => {
                    setSelection(
                      changes.checked ? combinedData.map((item) => item.courseId) : []
                    );
                  }}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.ColumnHeader>
              <Table.ColumnHeader>CRN(s)</Table.ColumnHeader>
              <Table.ColumnHeader>Course</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Credits</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Liked</Table.ColumnHeader>
              <Table.ColumnHeader>Planned Terms</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {combinedData.map((item) => (
              <Table.Row
                key={item.courseId}
                data-selected={selection.includes(item.courseId) ? '' : undefined}
                onClick={() => handleRowClick(item.courseId)}
                cursor="pointer"
              >
                <Table.Cell onClick={(e) => e.stopPropagation()}>
                  <Checkbox.Root
                    size="sm"
                    mt="0.5"
                    aria-label="Select row"
                    checked={selection.includes(item.courseId)}
                    onCheckedChange={(changes) => {
                      setSelection((prev) =>
                        changes.checked
                          ? [...prev, item.courseId]
                          : prev.filter((id) => id !== item.courseId)
                      );
                    }}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>
                <Table.Cell>
                  {item.crns.length > 0 ? (
                    <HStack gap={1} wrap="wrap">
                      {item.crns.map((crn) => (
                        <Badge key={crn} size="xs" variant="subtle">
                          {crn}
                        </Badge>
                      ))}
                    </HStack>
                  ) : (
                    '-'
                  )}
                </Table.Cell>
                <Table.Cell fontWeight="semibold">{item.courseNumber}</Table.Cell>
                <Table.Cell>{item.courseName}</Table.Cell>
                <Table.Cell>{item.credits || 'N/A'}</Table.Cell>
                <Table.Cell>
                  <Badge
                    size="sm"
                    colorPalette={
                      item.status === 'taken' ? 'green' :
                        item.status === 'planned' ? 'blue' :
                          'gray'
                    }
                  >
                    {item.status === 'taken' ? '✓ Taken' :
                      item.status === 'planned' ? 'Planned' :
                        'Considering'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    size="sm"
                    colorPalette={item.status === 'liked' ? 'pink' : 'gray'}
                    variant={item.status === 'liked' ? 'solid' : 'subtle'}
                  >
                    {item.status === 'liked' ? '❤️ Liked' : '-'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={1} wrap="wrap">
                    <Badge size="xs" variant="subtle">
                      {item.plannedTerm}
                    </Badge>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <ActionBar.Root open={hasSelection}>
          <Portal>
            <ActionBar.Positioner>
              <ActionBar.Content>
                <ActionBar.SelectionTrigger>
                  {selection.length} selected
                </ActionBar.SelectionTrigger>
                <ActionBar.Separator />
                <Button
                  variant="outline"
                  size="sm"
                  colorPalette="green"
                  onClick={handleBulkMarkAsTaken}
                >
                  <Icon as={MdCheckCircle} />
                  Mark as Taken
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  colorPalette={allLiked ? 'gray' : 'pink'}
                  onClick={handleBulkToggleLike}
                >
                  {allLiked ? '💔 Unlike' : '❤️ Like'} <Kbd>L</Kbd>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  colorPalette="orange"
                  onClick={handleBulkDeleteSections}
                >
                  Delete Sections
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  colorPalette="red"
                  onClick={handleBulkDelete}
                >
                  Delete Course <Kbd>⌫</Kbd>
                </Button>
              </ActionBar.Content>
            </ActionBar.Positioner>
          </Portal>
        </ActionBar.Root>
      </VStack>

      <Outlet />
    </>
  );
}

