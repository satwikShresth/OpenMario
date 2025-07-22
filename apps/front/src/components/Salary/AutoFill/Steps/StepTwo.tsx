import { Box, Separator, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Fields } from '../Fields';
import LinkClipboard from './LinkClipboard';
import { useStore } from '@tanstack/react-form';
import { coopCycle } from '@/helpers';

export default ({ form }: { form: any }) => {
   useEffect(() => form.setFieldValue('canPrev', () => true), []);
   const rankingUrl = useStore(
      form.store,
      //@ts-ignore: shutup
      ({ values: { year, coop_cycle, coop_round } }) =>
         'https://banner.drexel.edu/duprod/hwczksrmk.P_StudentReqMaintRanking?i_user_type=S&i_begin_term=' +
         year +
         (coopCycle.indexOf(coop_cycle) + 1) +
         `5&i_cycle=${coop_round}&i_mode=S&i_recs_per_page=20`,
   ) as string;
   return (
      <Box>
         <Text fontWeight='semibold' fontSize='lg' mt={10}>Details to access old offers</Text>
         <Separator mt={2} mb={5} />
         <Fields.CoopDetailsFields form={form} />
         <form.Subscribe
            //@ts-ignore: shutup
            selector={(state) => state.isValid}
         >
            {/*@ts-ignore: shutup*/}
            {(isValid) => {
               return isValid
                  ? <LinkClipboard url={rankingUrl} form={form} label='Link to access offers' />
                  : null;
            }}
         </form.Subscribe>
      </Box>
   );
};
