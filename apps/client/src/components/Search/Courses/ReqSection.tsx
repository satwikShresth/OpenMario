import { Tabs } from '@chakra-ui/react';
import { useState } from 'react';
import Req from './Req.tsx';
import PrerequisiteGraph from './PrerequisiteGraph';

type ReqSectionProps = {
   course_id: string;
};

export default function ReqSection({ course_id }: ReqSectionProps) {
   const [activeTab, setActiveTab] = useState('list');

   return (
      <Tabs.Root
         value={activeTab}
         onValueChange={event => setActiveTab(event.value)}
         variant='line'
         width='full'
         lazyMount
         unmountOnExit
      >
         <Tabs.List mb={4}>
            <Tabs.Trigger value='list'>List</Tabs.Trigger>
            <Tabs.Trigger value='graph'>Graph</Tabs.Trigger>
         </Tabs.List>
         <Tabs.Content value='list'>
            <Req course_id={course_id} />
         </Tabs.Content>
         <Tabs.Content value='graph'>
            {activeTab === 'graph' && (
               <PrerequisiteGraph course_id={course_id} mode='requirements' />
            )}
         </Tabs.Content>
      </Tabs.Root>
   );
}
