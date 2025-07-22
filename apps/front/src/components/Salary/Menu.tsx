import { Badge, Button, HStack, Icon, IconButton, Menu, Portal, Text } from '@chakra-ui/react';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { RiSurveyFill } from 'react-icons/ri';
import { MdDrafts, MdMarkEmailRead } from 'react-icons/md';
import { HiPlus } from 'react-icons/hi';
import type { SalaryRoute } from '@/routes/salary.tsx';
import { useMobile } from '@/hooks';
import { useSalaryStore } from './Store.ts';

export const ReportSalaryMenu = ({ Route }: { Route: SalaryRoute }) => {
   const navigate = Route.useNavigate();
   const drafts = useSalaryStore(({ draftSubmissions }) => draftSubmissions.length);
   const submissions = useSalaryStore(({ submissions }) => submissions.size);
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
                  <IconButton variant='solid' size='md'>
                     <Icon as={HiPlus} />
                  </IconButton>
               )
               : (
                  <Button variant='solid' size='md'>
                     <Icon as={HiPlus} />
                     <Text>Report Salary</Text>
                  </Button>
               )}
         </Menu.Trigger>

         <Portal>
            <Menu.Positioner>
               <Menu.Content>
                  <Menu.Item value='auto-fill' p={2} disabled={isMobile}>
                     <FaWandMagicSparkles />
                     Auto-Fill
                  </Menu.Item>
                  <Menu.Item value='report' p={2}>
                     <RiSurveyFill />
                     Manual Form
                  </Menu.Item>
                  <Menu.Item value='drafts' p={2} justifyContent='space-between'>
                     <HStack>
                        <MdDrafts /> Drafts
                     </HStack>
                     <Badge size='md' variant='outline' ml={3}>{drafts}</Badge>
                  </Menu.Item>
                  <Menu.Item value='submissions' p={2} justifyContent='space-between'>
                     <HStack>
                        <MdMarkEmailRead /> Submissions
                     </HStack>
                     <Badge size='md' variant='outline' ml={3}>{submissions}</Badge>
                  </Menu.Item>
               </Menu.Content>
            </Menu.Positioner>
         </Portal>
      </Menu.Root>
   );
};
