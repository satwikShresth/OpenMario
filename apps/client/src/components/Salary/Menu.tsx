import { Badge, Button, HStack, Icon, Menu, Portal, Text } from '@chakra-ui/react';
import { AutoFillIcon, SurveyIcon, MailIcon, MailReadIcon, AddIcon } from '@/components/icons';
import { useMobile } from '@/hooks';
import { useNavigate } from '@tanstack/react-router';
import { useLiveQuery, eq } from '@tanstack/react-db';
import { submissionsCollection } from '@/helpers';

export const ReportSalaryMenu = () => {
   const navigate = useNavigate();

   // Query for drafts
   const { data: draftSubmissions = [] } = useLiveQuery(
      (q) => q
         .from({ sub: submissionsCollection })
         .select(({ sub }) => sub)
         .where(({ sub }) => eq(sub.isDraft, true))
   );

   // Query for submissions
   const { data: submissionsData = [] } = useLiveQuery(
      (q) => q
         .from({ sub: submissionsCollection })
         .select(({ sub }) => sub)
         .where(({ sub }) => eq(sub.isDraft, false))
   );

   const drafts = draftSubmissions.length;
   const submissionsCount = submissionsData.length;
   const isMobile = useMobile();
   return (
      <Menu.Root
         onSelect={({ value }) =>
            navigate({
               to: `/salary/${value}`,
               reloadDocument: false,
               replace: true,
               resetScroll: true,
            })}
      >
         <Menu.Trigger asChild>
            {isMobile
               ? (
                  <Button variant='solid' size='md'>
                     <Text>Report</Text>
                     <Icon as={AddIcon} />
                  </Button>
               )
               : (
                  <Button variant='solid' size='md'>
                     <Icon as={AddIcon} />
                     <Text>Report Salary</Text>
                  </Button>
               )}
         </Menu.Trigger>

         <Portal>
            <Menu.Positioner>
               <Menu.Content>
                  <Menu.Item value='auto-fill' p={2} disabled={isMobile}>
                     <AutoFillIcon size={16} />
                     Auto-Fill
                  </Menu.Item>
                  <Menu.Item value='report' p={2}>
                     <SurveyIcon size={16} />
                     Manual Form
                  </Menu.Item>
                  <Menu.Item value='drafts' p={2} justifyContent='space-between'>
                     <HStack>
                        <MailIcon size={16} /> Drafts
                     </HStack>
                     <Badge size='md' variant='outline' ml={3}>{drafts}</Badge>
                  </Menu.Item>
                  <Menu.Item value='submissions' p={2} justifyContent='space-between'>
                     <HStack>
                        <MailReadIcon size={16} /> Submissions
                     </HStack>
                     <Badge size='md' variant='outline' ml={3}>{submissionsCount}</Badge>
                  </Menu.Item>
               </Menu.Content>
            </Menu.Positioner>
         </Portal>
      </Menu.Root>
   );
};
