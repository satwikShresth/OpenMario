import { useBreakpointValue } from '@chakra-ui/react';

export const useMobile = () => useBreakpointValue({ base: true, md: false });
