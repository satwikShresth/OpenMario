import { createFileRoute, useNavigate, Outlet } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { termsStore } from '@/db/stores/terms';
import { useAllSections } from '@/db/stores/sections';
import { useAllCourses } from '@/db/stores/courses';
import { planEventsStore } from '@/db/stores/plan-events';
import { upsertCourse, updateCourse, updateSection, deleteCourse, deleteSection, deletePlanEvent } from '@/db/mutations';
import {
  Table,
  Checkbox,
  ActionBar,
  Portal,
  Button,
  Kbd,
  Separator,
  Badge,
  HStack,
  Popover,
  Input,
  Text,
  Flex,
  Box,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { useState, useEffectEvent, useEffect } from 'react';
import { AddIcon, CheckCircleIcon, LightbulbIcon } from '@/components/icons';
import { useInstantSearch, Configure } from 'react-instantsearch';
import { toaster } from '@/components/ui/toaster';
import { useSearchContext } from '@/components/Search';
import { Courses } from '@/components/Courses';

export const Route = createFileRoute('/courses/profile')({
  beforeLoad: () => ({ getLabel: () => 'Profile' }),
  component: RouteComponent,
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

  const onAttach = useEffectEvent(() => setMeiliSearchParams({ distinct: 'course_id' }))
  const onDettach = useEffectEvent(() => setMeiliSearchParams({ distinct: undefined }))
  useEffect(() => { onAttach(); return () => onDettach() })

  const courses = results.__isArtificial ? [] : results.hits;
  const filterString = existingCourseIds.length === 0
    ? 'distinct="course_id"'
    : existingCourseIds.map(id => `course_id != "${id}"`).join(' AND ');

  const handleAddCourse = (course: any, status: 'taken' | 'considering') => {
    onAddCourse(course, status);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          <Icon as={AddIcon} />Add Course
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content minW="500px" maxH="600px">
            <Popover.Arrow />
            <Popover.Header><Text fontWeight="semibold">Add Course</Text></Popover.Header>
            <Popover.Body>
              <Flex direction="column" gap={3}>
                <Input placeholder="Search courses..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                {status === 'loading' && (
                  <HStack justify="center" p={4}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="fg.muted">Searching...</Text>
                  </HStack>
                )}
                {status === 'idle' && courses.length === 0 && searchQuery && (
                  <Text fontSize="sm" color="fg.muted" textAlign="center" p={4}>No courses found</Text>
                )}
                {courses.length > 0 && (
                  <Flex direction="column" gap={2} maxH="400px" overflowY="auto">
                    {courses.map((course: any) => (
                      <HStack key={course.id} justify="space-between" p={3}
                        borderWidth="1px" borderRadius="md" _hover={{ bg: 'bg.muted' }}>
                        <Flex direction="column" gap={1} flex={1}>
                          <Text fontSize="sm" fontWeight="bold">{course.course}</Text>
                          <Text fontSize="xs" color="fg.muted" lineClamp={1}>{course.title}</Text>
                          {course.credits && <Badge size="xs" width="fit-content">{course.credits} Credits</Badge>}
                        </Flex>
                        <HStack gap={1}>
                          <Button size="xs" colorPalette="green" variant="outline"
                            onClick={() => handleAddCourse(course, 'taken')}>
                            <Icon as={CheckCircleIcon} />Taken
                          </Button>
                          <Button size="xs" colorPalette="gray" variant="outline"
                            onClick={() => handleAddCourse(course, 'considering')}>
                            <Icon as={LightbulbIcon} />Consider
                          </Button>
                        </HStack>
                      </HStack>
                    ))}
                  </Flex>
                )}
              </Flex>
            </Popover.Body>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
      <Configure hitsPerPage={20} query={searchQuery} filters={filterString} />
    </Popover.Root>
  );
}

function RouteComponent() {
  const [selection, setSelection] = useState<string[]>([]);
  const navigate = useNavigate();

  const allCourses = useAllCourses();
  const rawSections = useAllSections();
  const allTermsMap = useStore(termsStore);
  const allEventsMap = useStore(planEventsStore);

  const allSections = rawSections.map(s => ({
    ...s,
    term_label: s.term_id
      ? (() => { const t = allTermsMap.get(s.term_id); return t ? `${t.term} ${t.year}` : null; })()
      : null,
  }));

  const allPlanEvents = Array.from(allEventsMap.values()).map(e => ({
    id: e.id,
    crn: e.crn,
    term_name: allTermsMap.get(e.term_id)?.term ?? '',
    term_year: allTermsMap.get(e.term_id)?.year ?? 0,
  }));

  const combinedData: CombinedCourseData[] = allCourses.map((course) => {
    const courseSections = allSections.filter(s => s.course_id === course.id);
    const crns = courseSections.map(s => s.crn);
    const hasLikedSection = courseSections.some(s => s.liked);
    const firstSection = courseSections[0];
    const plannedTerm = firstSection?.term_label ?? '-';

    let courseStatus: 'considering' | 'planned' | 'liked' | 'taken';
    if (course.completed) courseStatus = 'taken';
    else if (hasLikedSection) courseStatus = 'liked';
    else if (courseSections.length > 0) courseStatus = 'planned';
    else courseStatus = 'considering';

    return {
      courseId: course.id, courseName: course.title, courseNumber: course.course,
      credits: course.credits, status: courseStatus, crns, plannedTerm
    };
  });

  const takenCredits = combinedData.filter(i => i.status === 'taken' && i.credits)
    .reduce((sum, i) => sum + (Number(i.credits) || 0), 0);
  const activeCredits = combinedData.filter(i => i.status !== 'taken' && i.credits)
    .reduce((sum, i) => sum + (Number(i.credits) || 0), 0);
  const existingCourseIds = combinedData.map(i => i.courseId);

  const hasSelection = selection.length > 0;
  const indeterminate = hasSelection && selection.length < combinedData.length;
  const selectedItems = combinedData.filter(i => selection.includes(i.courseId));
  const allLiked = selectedItems.every(i => i.status === 'liked');

  const handleBulkToggleLike = async () => {
    const shouldLike = !allLiked;
    await Promise.all(
      selection.flatMap(courseId => {
        const courseData = combinedData.find(i => i.courseId === courseId);
        return (courseData?.crns ?? []).map(crn => updateSection(crn, { liked: shouldLike }));
      })
    );
    setSelection([]);
  };

  const handleBulkDelete = async () => {
    for (const courseId of selection) {
      const courseData = combinedData.find(i => i.courseId === courseId);
      if (!courseData) continue;
      await Promise.all(
        courseData.crns.flatMap(crn => {
          const eventDeletes = allPlanEvents.filter(e => e.crn === crn).map(e => deletePlanEvent(e.id));
          return [...eventDeletes, deleteSection(crn)];
        })
      );
      await deleteCourse(courseId);
    }
    setSelection([]);
  };

  const handleBulkMarkAsTaken = async () => {
    await Promise.all(selection.map(courseId => updateCourse(courseId, { completed: true })));
    toaster.create({
      title: 'Marked as Taken',
      description: `${selection.length} course${selection.length > 1 ? 's' : ''} marked as taken`,
      type: 'success',
    });
    setSelection([]);
  };

  const handleBulkDeleteSections = async () => {
    for (const courseId of selection) {
      const courseData = combinedData.find(i => i.courseId === courseId);
      if (!courseData) continue;
      await Promise.all(
        courseData.crns.flatMap(crn => {
          const eventDeletes = allPlanEvents.filter(e => e.crn === crn).map(e => deletePlanEvent(e.id));
          return [...eventDeletes, deleteSection(crn)];
        })
      );
      await updateCourse(courseId, { completed: false });
    }
    toaster.create({
      title: 'Sections Deleted',
      description: `Sections removed. ${selection.length} course${selection.length > 1 ? 's' : ''} now marked as considering.`,
      type: 'success',
    });
    setSelection([]);
  };

  const handleAddCourse = async (course: any, status: 'taken' | 'considering') => {
    try {
      const courseId = course.course_id || course.id;
      const existing = allCourses.find(c => c.id === courseId);
      if (existing) {
        toaster.create({ title: 'Course Already Added', description: `${course.course} is already in your profile`, type: 'warning' });
        return;
      }
      await upsertCourse({ id: courseId, course: course.course, title: course.title,
        credits: course.credits ?? null, completed: status === 'taken' });
      toaster.create({
        title: 'Course Added',
        description: `${course.course} has been added as ${status === 'taken' ? 'taken' : 'considering'}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding course:', error);
      toaster.create({ title: 'Error', description: 'Failed to add course', type: 'error' });
    }
  };

  const handleRowClick = (courseId: string) => {
    navigate({ to: '/courses/profile/$course_id', params: { course_id: courseId } });
  };

  return (
    <>
      <Courses.Root maxW='5xl'>
        <Flex justify='space-between' align='center' wrap='wrap' gap={3}>
          <HStack gap={3}>
            <Courses.PageHeader title='Course Profile' />
            <CourseSearchPopover onAddCourse={handleAddCourse} existingCourseIds={existingCourseIds} />
          </HStack>
          <HStack gap={2}>
            <Badge colorPalette="green" variant='subtle'>{takenCredits} credits taken</Badge>
            <Badge colorPalette="blue" variant='subtle'>{activeCredits} credits active</Badge>
          </HStack>
        </Flex>
        <Separator />
        <Box overflowX='auto'>
          <Table.Root size="sm" variant="outline" interactive>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader w="6" onClick={(e) => e.stopPropagation()}>
                  <Checkbox.Root size="sm" mt="0.5" aria-label="Select all rows"
                    checked={indeterminate ? 'indeterminate' : selection.length > 0}
                    onCheckedChange={(changes) => {
                      setSelection(changes.checked ? combinedData.map(i => i.courseId) : []);
                    }}>
                    <Checkbox.HiddenInput /><Checkbox.Control />
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
                <Table.Row key={item.courseId} data-selected={selection.includes(item.courseId) ? '' : undefined}
                  onClick={() => handleRowClick(item.courseId)} cursor="pointer">
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Checkbox.Root size="sm" mt="0.5" aria-label="Select row"
                      checked={selection.includes(item.courseId)}
                      onCheckedChange={(changes) => {
                        setSelection(prev => changes.checked ? [...prev, item.courseId] : prev.filter(id => id !== item.courseId));
                      }}>
                      <Checkbox.HiddenInput /><Checkbox.Control />
                    </Checkbox.Root>
                  </Table.Cell>
                  <Table.Cell>
                    {item.crns.length > 0
                      ? <HStack gap={1} wrap="wrap">{item.crns.map(crn => <Badge key={crn} size="xs" variant="subtle">{crn}</Badge>)}</HStack>
                      : '-'}
                  </Table.Cell>
                  <Table.Cell fontWeight="semibold">{item.courseNumber}</Table.Cell>
                  <Table.Cell>{item.courseName}</Table.Cell>
                  <Table.Cell>{item.credits || 'N/A'}</Table.Cell>
                  <Table.Cell>
                    <Badge size="sm" colorPalette={item.status === 'taken' ? 'green' : item.status === 'planned' ? 'blue' : 'gray'}>
                      {item.status === 'taken' ? '✓ Taken' : item.status === 'planned' ? 'Planned' : 'Considering'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="sm" colorPalette={item.status === 'liked' ? 'pink' : 'gray'}
                      variant={item.status === 'liked' ? 'solid' : 'subtle'}>
                      {item.status === 'liked' ? '❤️ Liked' : '-'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap={1} wrap="wrap">
                      <Badge size="xs" variant="subtle">{item.plannedTerm}</Badge>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <ActionBar.Root open={hasSelection}>
          <Portal>
            <ActionBar.Positioner>
              <ActionBar.Content>
                <ActionBar.SelectionTrigger>{selection.length} selected</ActionBar.SelectionTrigger>
                <ActionBar.Separator />
                <Button variant="outline" size="sm" colorPalette="green" onClick={handleBulkMarkAsTaken}>
                  <Icon as={CheckCircleIcon} />Mark as Taken
                </Button>
                <Button variant="outline" size="sm" colorPalette={allLiked ? 'gray' : 'pink'} onClick={handleBulkToggleLike}>
                  {allLiked ? '💔 Unlike' : '❤️ Like'} <Kbd>L</Kbd>
                </Button>
                <Button variant="outline" size="sm" colorPalette="orange" onClick={handleBulkDeleteSections}>
                  Delete Sections
                </Button>
                <Button variant="outline" size="sm" colorPalette="red" onClick={handleBulkDelete}>
                  Delete Course <Kbd>⌫</Kbd>
                </Button>
              </ActionBar.Content>
            </ActionBar.Positioner>
          </Portal>
        </ActionBar.Root>
      </Courses.Root>
      <Outlet />
    </>
  );
}
