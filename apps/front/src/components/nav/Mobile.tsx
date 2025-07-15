import { Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { Link, linkOptions } from "@tanstack/react-router";
import { NAV_ITEMS } from "./items";

const MobileNav = ({ onToggle }: { onToggle: () => void }) => {
   return (
      <Stack bg="card" p={4} borderRadius="lg" gap={5}>
         {NAV_ITEMS.map(({ label, section, href }) => (
            <ChakraLink
               key={`mobile-${label}`}
               as={Link}
               {...linkOptions({
                  to: `${href}${section}`,
                  hashScrollIntoView: true,
               })}
               onClick={() => onToggle()}
               _hover={{ color: "accent" }}
               fontWeight={600}
            >
               <Text>{label}</Text>
            </ChakraLink>
         ))}
      </Stack>
   );
};

export default MobileNav;
