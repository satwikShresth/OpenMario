import { Stat } from '@chakra-ui/react';
import { InfoTip } from '@/components/ui';
import { useStats } from 'react-instantsearch';

export const Stats = () => {
   const stats = useStats();
   return (
      <Stat.Root ml={1}>
         <Stat.Label>
            Stats
            <InfoTip>Search performance</InfoTip>
         </Stat.Label>
         <Stat.ValueText alignItems='baseline'>
            {stats.nbHits}
            <Stat.ValueUnit>hits in</Stat.ValueUnit>
            {stats.processingTimeMS}
            <Stat.ValueUnit>ms</Stat.ValueUnit>
         </Stat.ValueText>
      </Stat.Root>
   );
};
