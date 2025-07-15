import { Box, Link as ChakraLink, Stack } from "@chakra-ui/react";
import { Link, linkOptions } from "@tanstack/react-router";
import { NAV_ITEMS } from "./items";

const DesktopNav = () => (
   <Stack direction="row" justify="center">
      {NAV_ITEMS.map((navItem) => (
         <Box key={navItem.label}>
            <ChakraLink
               p={2}
               m={2}
               as={Link}
               {...linkOptions({
                  to: `${navItem.href}${navItem.section}`,
                  hashScrollIntoView: true,
               })}
               fontSize="sm"
               fontWeight={500}
               color="text"
               position="relative"
               borderWidth="1px"
               borderRadius="lg"
               _hover={{
                  textDecoration: "none",
                  shadow: "md",
                  color: "accent",
                  borderColor: "accent",
                  _after: {
                     width: "50%",
                  },
               }}
               _after={{
                  content: '""',
                  position: "absolute",
                  width: "0%",
                  height: "1px",
                  bottom: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "accent",
                  transition: "width 0.3s ease",
               }}
            >
               {navItem.label}
            </ChakraLink>
         </Box>
      ))}
   </Stack>
);

export default DesktopNav;
