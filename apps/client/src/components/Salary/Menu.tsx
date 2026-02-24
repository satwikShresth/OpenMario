import { Badge, Button, HStack, Icon, Menu, Portal, Text } from '@chakra-ui/react';
import { AutoFillIcon, SurveyIcon, MailIcon, MailReadIcon, AddIcon } from '@/components/icons';
import { useMobile } from '@/hooks';
import { useNavigate } from '@tanstack/react-router';
import { useSubmissions } from '@/db/stores/submissions';

export const ReportSalaryMenu = () => {
   const navigate = useNavigate();

   const drafts = useSubmissions(true).length;
   const submissionsCount = useSubmissions(false).length;
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
