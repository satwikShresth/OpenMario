import { Button, Icon, Menu, Portal, Text, useBreakpointValue } from '@chakra-ui/react';
import { LuShare, LuTrash2 } from 'react-icons/lu';
import { HiPlus } from 'react-icons/hi';

export default () => {
   const isMobile = useBreakpointValue({ base: true, md: false });
   return (
      <>
         <Menu.Root>
            <Menu.Trigger asChild>
               <Button
                  variant='solid'
                  size={isMobile ? 'md' : 'lg'}
               >
                  <Icon as={HiPlus} />
                  <Text>Report Salary</Text>
               </Button>
            </Menu.Trigger>

            <Portal>
               <Menu.Positioner>
                  <Menu.Content>
                     <Menu.Item value='delete'>
                        <LuTrash2 />
                        Delete
                     </Menu.Item>
                     <Menu.Item value='share'>
                        <LuShare />
                        Share
                     </Menu.Item>
                  </Menu.Content>
               </Menu.Positioner>
            </Portal>
         </Menu.Root>
      </>
   );
};
