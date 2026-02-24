import { Badge, Box, Table, Tabs, Text } from '@chakra-ui/react';
import { termLabel, type Section } from './types';
import { useProfessorDetail } from './detailStore';

function SectionsTable({ sections, emptyMsg }: { sections: Section[]; emptyMsg: string }) {
   if (sections.length === 0) {
      return (
         <Box textAlign='center' py={8}>
            <Text color='fg.muted'>{emptyMsg}</Text>
         </Box>
      );
   }
   return (
      <Box overflowX='auto' maxH='400px' overflowY='auto'>
         <Table.Root size='sm'>
            <Table.Header position='sticky' top={0} bg='bg' zIndex={1}>
               <Table.Row>
                  <Table.ColumnHeader>Term</Table.ColumnHeader>
                  <Table.ColumnHeader>Course</Table.ColumnHeader>
                  <Table.ColumnHeader>Title</Table.ColumnHeader>
                  <Table.ColumnHeader>Section</Table.ColumnHeader>
                  <Table.ColumnHeader>Method</Table.ColumnHeader>
               </Table.Row>
            </Table.Header>
            <Table.Body>
               {sections.map(s => (
                  <Table.Row key={`${s.section_crn}-${s.term_id}`}>
                     <Table.Cell whiteSpace='nowrap'>{termLabel(s.term_id)}</Table.Cell>
                     <Table.Cell whiteSpace='nowrap'>{s.subject_code} {s.course_number}</Table.Cell>
                     <Table.Cell maxW='220px'>
                        <Text lineClamp={2} title={s.course_title} fontSize='sm'>{s.course_title}</Text>
                     </Table.Cell>
                     <Table.Cell>{s.section_code}</Table.Cell>
                     <Table.Cell>
                        {s.instruction_method ? (
                           <Badge size='sm' variant='surface' colorPalette='purple'>{s.instruction_method}</Badge>
                        ) : (
                           <Text color='fg.muted'>—</Text>
                        )}
                     </Table.Cell>
                  </Table.Row>
               ))}
            </Table.Body>
         </Table.Root>
      </Box>
   );
}

export function SectionsTab() {
   const upcomingSections = useProfessorDetail(s => s.upcomingSections);
   const pastSections = useProfessorDetail(s => s.pastSections);
   const isLoading = useProfessorDetail(s => s.isLoading);

   if (isLoading) return null;
   return (
      <Box>
         <Text fontWeight='semibold' fontSize='lg' mb={3}>Sections</Text>
         <Tabs.Root defaultValue='upcoming' variant='line'>
            <Tabs.List>
               <Tabs.Trigger value='upcoming'>
                  Upcoming / Current
                  {upcomingSections.length > 0 && (
                     <Badge ml={2} size='sm' colorPalette='green' variant='subtle'>
                        {upcomingSections.length}
                     </Badge>
                  )}
               </Tabs.Trigger>
               <Tabs.Trigger value='past'>
                  Past Sections
                  {pastSections.length > 0 && (
                     <Badge ml={2} size='sm' colorPalette='gray' variant='subtle'>
                        {pastSections.length}
                     </Badge>
                  )}
               </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value='upcoming'>
               <SectionsTable sections={upcomingSections} emptyMsg='No upcoming sections found' />
            </Tabs.Content>
            <Tabs.Content value='past'>
               <SectionsTable sections={pastSections} emptyMsg='No past sections found' />
            </Tabs.Content>
         </Tabs.Root>
      </Box>
   );
}
