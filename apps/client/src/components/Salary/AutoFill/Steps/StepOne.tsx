import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import LinkClipboard from './LinkClipboard';

export default ({ form }: any) => {
   const bannerUrl =
      'https://bannersso.drexel.edu/ssomanager/c/SSB?pkg=bwszkfrag.P_DisplayFinResponsibility%3Fi_url%3Dhwczksrmp.P_StudentRequestMaintStud';

   useEffect(() => form.setFieldValue('canPrev', () => false), []);

   return (
      <Box mt={5}>
         <LinkClipboard url={bannerUrl} form={form} label='Login to your DrexelOne account' />
      </Box>
   );
};
