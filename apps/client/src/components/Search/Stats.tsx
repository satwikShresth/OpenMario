import { Flex, Stat } from '@chakra-ui/react';
import { useStats } from 'react-instantsearch';
import { useMobile } from '@/hooks';

export const Stats = () => {
   const isMobile = useMobile();
   const stats = useStats();
   return (
      <Stat.Root ml={1}>
         {isMobile
            ? (
               <Flex justify='space-between'>
                  <Stat.HelpText>
                     Page {stats.page}
                  </Stat.HelpText>
                  <Stat.HelpText>
                     {stats.nbHits} hits in {stats.processingTimeMS}
                     <Stat.ValueUnit>ms</Stat.ValueUnit>
                  </Stat.HelpText>
               </Flex>
            )
            : (
               <Stat.ValueText alignItems='baseline'>
                  {stats.nbHits}
                  <Stat.ValueUnit>hits in</Stat.ValueUnit>
                  {stats.processingTimeMS}
                  <Stat.ValueUnit>ms</Stat.ValueUnit>
               </Stat.ValueText>
            )}
      </Stat.Root>
   );
};
