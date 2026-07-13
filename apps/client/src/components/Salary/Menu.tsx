import { Badge, Button, HStack, Icon, Menu, Portal, Text } from '@chakra-ui/react';
import { AutoFillIcon, SurveyIcon, MailIcon, MailReadIcon, AddIcon } from '@/components/icons';
import { useMobile } from '@/hooks';
import { Link } from '@tanstack/react-router';
import { useSubmissions } from '@/db/stores/submissions';

export const ReportSalaryMenu = () => {
   const drafts = useSubmissions(true).length;
   const submissionsCount = useSubmissions(false).length;
   const isMobile = useMobile();

   return (
      <Menu.Root>
         <Menu.Trigger asChild>
            {isMobile ? (
               <Button variant='solid' size={{ base: 'lg', md: 'xl' }}>
                  <Text>Report</Text>
                  <Icon as={AddIcon} />
               </Button>
            ) : (
               <Button variant='solid' size={{ base: 'lg', md: 'xl' }}>
                  <Icon as={AddIcon} />
                  <Text>Report Salary</Text>
               </Button>
            )}
         </Menu.Trigger>

         <Portal>
            <Menu.Positioner>
               <Menu.Content>
                  <Menu.Item value='auto-fill' p={2} asChild disabled={isMobile}>
                     <Link to='/salary/auto-fill'>
                        <AutoFillIcon size={16} />
                        Auto-Fill
                     </Link>
                  </Menu.Item>
                  <Menu.Item value='report' p={2} asChild>
                     <Link to='/salary/report'>
                        <SurveyIcon size={16} />
                        Manual Form
                     </Link>
                  </Menu.Item>
                  <Menu.Item value='drafts' p={2} asChild justifyContent='space-between'>
                     <Link to='/salary/drafts'>
                        <HStack>
                           <MailIcon size={16} /> Drafts
                        </HStack>
                        <Badge size='md' variant='outline' ml={3}>
                           {drafts}
                        </Badge>
                     </Link>
                  </Menu.Item>
                  <Menu.Item value='submissions' p={2} asChild justifyContent='space-between'>
                     <Link to='/salary/submissions'>
                        <HStack>
                           <MailReadIcon size={16} /> Submissions
                        </HStack>
                        <Badge size='md' variant='outline' ml={3}>
                           {submissionsCount}
                        </Badge>
                     </Link>
                  </Menu.Item>
               </Menu.Content>
            </Menu.Positioner>
         </Portal>
      </Menu.Root>
   );
};
