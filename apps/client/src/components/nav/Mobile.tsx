import { Link as ChakraLink, Stack, Text, Badge, Float, Box } from '@chakra-ui/react';
import { Link, linkOptions } from '@tanstack/react-router';
import { NAV_ITEMS } from './items';

const MobileNav = ({ onToggle }: { onToggle: () => void }) => {
   return (
      <Stack bg='card' p={4} borderRadius='lg' gap={5}>
         {NAV_ITEMS.map(({ label, section, href, badge }) => (
            <Box key={`mobile-${label}`} position='relative' display='inline-block'>
               <ChakraLink
                  as={Link}
                  {...linkOptions({
                     to: `${href}${section}`,
                     hashScrollIntoView: true,
                  })}
                  onClick={() => onToggle()}
                  _hover={{ color: 'accent' }}
                  fontWeight={600}
               >
                  <Text>{label}</Text>
               </ChakraLink>
               {badge && (
                  <Float placement='top-end' offsetX='-2' offsetY='2'>
                     <Badge
                        colorPalette={badge.colorPalette || 'gray'}
                        variant={badge.variant || 'subtle'}
                        size='xs'
                     >
                        {badge.text}
                     </Badge>
                  </Float>
               )}
            </Box>
         ))}
      </Stack>
   );
};

export default MobileNav;
