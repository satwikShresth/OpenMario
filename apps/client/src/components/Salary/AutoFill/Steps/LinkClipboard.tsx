import {
   Button,
   Clipboard,
   Flex,
   Input,
   InputGroup,
   Link as ChakraLink,
   Separator,
   Text,
} from '@chakra-ui/react';
import { Link, linkOptions } from '@tanstack/react-router';
import { FaClipboard } from 'react-icons/fa';
import { LuExternalLink } from 'react-icons/lu';

export default ({ label, url, form }: { label: string; url: string; form: any }) => (
   <Clipboard.Root maxW='full' value={url} mt={10}>
      <Clipboard.Label textStyle='label' fontSize='lg'>
         {label}
         <Separator mt={2} />
      </Clipboard.Label>
      <InputGroup mt={5}>
         <Clipboard.Input asChild>
            <Input />
         </Clipboard.Input>
      </InputGroup>
      <Flex gap={4} mt={3} justify='center'>
         <Clipboard.Trigger asChild>
            <Button variant='surface' size='md' me='-2'>
               <Text>Copy</Text>
               <FaClipboard />
            </Button>
         </Clipboard.Trigger>
         <ChakraLink asChild>
            <Button
               as={Link}
               {...linkOptions({
                  //@ts-ignore: shutuup
                  to: url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
               })}
               onClick={() =>
                  //@ts-ignore: shutuup
                  form.setFieldValue('step', (value) =>
                     value + 1)}
               variant='surface'
               size='md'
               me='-2'
            >
               <Text>Open Link</Text>
               <LuExternalLink />
            </Button>
         </ChakraLink>
      </Flex>
   </Clipboard.Root>
);
