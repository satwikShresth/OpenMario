import {
   Box,
   Button,
   Code,
   Flex,
   Heading,
   Icon,
   Image,
   List,
   Separator,
   Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { CheckIcon, ClipboardIcon } from '@/components/icons';

const MCP_URL = 'https://mcp.openmario.com';

const CURSOR_JSON = `{
  "mcpServers": {
    "openmario": {
      "url": "${MCP_URL}"
    }
  }
}`;

const CLAUDE_CODE_CMD = `claude mcp add --transport http openmario ${MCP_URL}`;

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
   const [copied, setCopied] = useState(false);

   return (
      <Button
         size='sm'
         variant='outline'
         onClick={async () => {
            try {
               await navigator.clipboard.writeText(value);
               setCopied(true);
               window.setTimeout(() => setCopied(false), 1500);
            } catch {
               /* ignore */
            }
         }}
      >
         <Icon as={copied ? CheckIcon : ClipboardIcon} boxSize={3.5} />
         {copied ? 'Copied' : label}
      </Button>
   );
}

function Snippet({ value }: { value: string }) {
   return (
      <Box
         borderWidth='1px'
         borderColor='border'
         borderRadius='md'
         bg='bg.subtle'
         overflow='hidden'
      >
         <Flex
            align='center'
            justify='flex-end'
            px={3}
            py={2}
            borderBottomWidth='1px'
            borderColor='border'
         >
            <CopyButton value={value} />
         </Flex>
         <Box as='pre' m={0} px={4} py={3} overflowX='auto' fontSize='sm' lineHeight='1.6'>
            <Code bg='transparent' whiteSpace='pre' display='block'>
               {value}
            </Code>
         </Box>
      </Box>
   );
}

function GuideShot({
   src,
   alt,
   caption,
}: {
   src: string;
   alt: string;
   caption: string;
}) {
   return (
      <Box mt={3} mb={1}>
         <Box
            borderWidth='1px'
            borderColor='border'
            borderRadius='lg'
            overflow='hidden'
            bg='bg.subtle'
         >
            <Image src={src} alt={alt} w='full' display='block' />
         </Box>
         <Text fontSize='sm' color='fg.muted' mt={2} lineHeight='1.5'>
            {caption}
         </Text>
      </Box>
   );
}

export function McpInstallPage() {
   return (
      <Flex
         direction='column'
         gap={8}
         w='full'
         minW={0}
         maxW='3xl'
         pb={4}
         fontFamily='body'
      >
         <Box>
            <Text fontSize='md' color='fg.muted' lineHeight='1.75'>
               MCP (Model Context Protocol) lets an AI app call OpenMario the same way you’d
               browse this site — search courses and sections, look up professors, compare
               companies and co-op reviews, and check salaries. Answers can include real
               OpenMario links back to the pages here.
            </Text>
            <Text fontSize='md' color='fg.muted' lineHeight='1.75' mt={3}>
               You don’t install software on your computer for the web version. You just point
               Claude (or Cursor) at our public server:
            </Text>
            <Flex align='center' gap={3} mt={4} flexWrap='wrap'>
               <Code px={3} py={1.5} borderRadius='md' fontSize='sm'>
                  {MCP_URL}
               </Code>
               <CopyButton value={MCP_URL} label='Copy URL' />
            </Flex>
         </Box>

         <Separator />

         <Box>
            <Heading as='h2' fontFamily='body' fontSize='lg' fontWeight='semibold' mb={2}>
               Claude on the web (claude.ai)
            </Heading>
            <Text fontSize='md' color='fg.muted' lineHeight='1.75' mb={4}>
               This is the normal Claude chat in your browser. Anthropic calls these{' '}
               <Text as='span' fontWeight='medium' color='fg'>
                  custom connectors
               </Text>
               . Free accounts can add one; Pro/Max can add more.
            </Text>
            <List.Root as='ol' ps={5} gap={2} fontSize='md' color='fg' lineHeight='1.7'>
               <List.Item>
                  In a chat, click the{' '}
                  <Text as='span' fontWeight='medium'>
                     +
                  </Text>{' '}
                  button →{' '}
                  <Text as='span' fontWeight='medium'>
                     Connectors
                  </Text>{' '}
                  →{' '}
                  <Text as='span' fontWeight='medium'>
                     Add connector
                  </Text>{' '}
                  →{' '}
                  <Text as='span' fontWeight='medium'>
                     Add custom connector
                  </Text>
                  .
                  <GuideShot
                     src='/mcp/claude-add-connector.jpg'
                     alt='Claude chat + menu showing Connectors → Add connector → Add custom connector'
                     caption='From the chat composer: + → Connectors → Add connector → Add custom connector.'
                  />
               </List.Item>
               <List.Item>
                  You can also manage connectors under{' '}
                  <Text as='span' fontWeight='medium'>
                     Customize → Connectors
                  </Text>{' '}
                  (
                  <Code fontSize='sm'>claude.ai/customize/connectors</Code>
                  ).
               </List.Item>
               <List.Item>
                  In the dialog, set{' '}
                  <Text as='span' fontWeight='medium'>
                     Name
                  </Text>{' '}
                  to OpenMario and{' '}
                  <Text as='span' fontWeight='medium'>
                     URL
                  </Text>{' '}
                  to:
                  <Box mt={2}>
                     <Snippet value={MCP_URL} />
                  </Box>
                  Leave OAuth blank (not required). Then click{' '}
                  <Text as='span' fontWeight='medium'>
                     Add
                  </Text>
                  .
                  <GuideShot
                     src='/mcp/claude-custom-connector-url.jpg'
                     alt='Add custom connector dialog with Name OpenMario and URL https://mcp.openmario.com'
                     caption='Name: OpenMario · URL: https://mcp.openmario.com (no /mcp path, no OAuth).'
                  />
               </List.Item>
               <List.Item>
                  Back in chat, open{' '}
                  <Text as='span' fontWeight='medium'>
                     +
                  </Text>{' '}
                  →{' '}
                  <Text as='span' fontWeight='medium'>
                     Connectors
                  </Text>{' '}
                  and turn on{' '}
                  <Text as='span' fontWeight='medium'>
                     OpenMario
                  </Text>{' '}
                  for that conversation.
               </List.Item>
               <List.Item>
                  Ask something concrete, e.g. “Find co-op salaries for technology auditor roles”
                  or “What electives help with bank auditing?”
               </List.Item>
            </List.Root>
            <Text fontSize='sm' color='fg.muted' lineHeight='1.7' mt={4}>
               Claude reaches our server from Anthropic’s cloud, so the public URL above is
               required — <Code fontSize='xs'>localhost</Code> will not work here.
            </Text>
         </Box>

         <Separator />

         <Box>
            <Heading as='h2' fontFamily='body' fontSize='lg' fontWeight='semibold' mb={2}>
               Cursor
            </Heading>
            <Text fontSize='md' color='fg.muted' lineHeight='1.75' mb={4}>
               Add OpenMario as a remote MCP server in Cursor settings, or paste this into your
               MCP config file (
               <Code fontSize='sm'>mcp.json</Code>):
            </Text>
            <List.Root as='ol' ps={5} gap={2} fontSize='md' color='fg' lineHeight='1.7' mb={4}>
               <List.Item>
                  Open{' '}
                  <Text as='span' fontWeight='medium'>
                     Cursor Settings → MCP
                  </Text>
                  .
               </List.Item>
               <List.Item>
                  Add a new remote / HTTP server named{' '}
                  <Text as='span' fontWeight='medium'>
                     openmario
                  </Text>{' '}
                  with URL <Code fontSize='sm'>{MCP_URL}</Code>, or paste:
               </List.Item>
            </List.Root>
            <Snippet value={CURSOR_JSON} />
            <Text fontSize='sm' color='fg.muted' lineHeight='1.7' mt={3}>
               Restart or refresh MCP if tools don’t show up, then ask the agent about courses,
               companies, or salaries.
            </Text>
         </Box>

         <Separator />

         <Box>
            <Heading as='h2' fontFamily='body' fontSize='lg' fontWeight='semibold' mb={2}>
               Claude Code
            </Heading>
            <Text fontSize='md' color='fg.muted' lineHeight='1.75' mb={4}>
               If you use Anthropic’s Claude Code CLI in the terminal, run:
            </Text>
            <Snippet value={CLAUDE_CODE_CMD} />
            <Text fontSize='sm' color='fg.muted' lineHeight='1.7' mt={3}>
               Then start a Claude Code session and ask it to use the OpenMario tools.
            </Text>
         </Box>

         <Separator />

         <Box>
            <Heading as='h2' fontFamily='body' fontSize='lg' fontWeight='semibold' mb={2}>
               ChatGPT
            </Heading>
            <Text fontSize='md' color='fg.muted' lineHeight='1.75' mb={4}>
               ChatGPT can use the same public MCP URL as a custom connector / developer-mode app.
               Availability is strongest on Business and Enterprise; Plus/Pro may need Developer mode.
            </Text>
            <List.Root as='ol' ps={5} gap={2} fontSize='md' color='fg' lineHeight='1.7'>
               <List.Item>
                  Open ChatGPT Settings → Apps / Connectors → Advanced and turn on{' '}
                  <Text as='span' fontWeight='medium'>
                     Developer mode
                  </Text>
                  . On Business/Enterprise, an admin may need to enable this first.
               </List.Item>
               <List.Item>
                  Go to Settings → Apps / Connectors (or{' '}
                  <Code fontSize='sm'>chatgpt.com/plugins</Code>) and click{' '}
                  <Text as='span' fontWeight='medium'>
                     Create
                  </Text>{' '}
                  / <Text as='span' fontWeight='medium'>+</Text>.
               </List.Item>
               <List.Item>
                  Set name to OpenMario, auth to{' '}
                  <Text as='span' fontWeight='medium'>
                     None
                  </Text>
                  , and MCP server URL to:
                  <Box mt={2}>
                     <Snippet value={MCP_URL} />
                  </Box>
               </List.Item>
               <List.Item>
                  Confirm you trust the app → Create. ChatGPT should list OpenMario tools.
               </List.Item>
               <List.Item>
                  In a chat, open{' '}
                  <Text as='span' fontWeight='medium'>
                     +
                  </Text>{' '}
                  and enable the OpenMario connector, then ask about courses, companies, or salaries.
               </List.Item>
            </List.Root>
            <Text fontSize='sm' color='fg.muted' lineHeight='1.7' mt={4}>
               Same rule as Claude: use the public URL above — localhost will not work unless you
               tunnel it. For debugging, you can also add the URL in the OpenAI API Playground under
               Tools → MCP Server.
            </Text>
         </Box>

         <Separator />

         <Box>
            <Heading as='h2' fontFamily='body' fontSize='lg' fontWeight='semibold' mb={2}>
               What it can do
            </Heading>
            <List.Root ps={5} gap={1.5} fontSize='md' color='fg.muted' lineHeight='1.7'>
               <List.Item>Search courses, sections, professors, companies, and salaries</List.Item>
               <List.Item>Pull course prereqs, professor ratings, company reviews, and pay context</List.Item>
               <List.Item>Generate and decode Plan of Study share links</List.Item>
            </List.Root>
         </Box>
      </Flex>
   );
}
