import { createFileRoute } from '@tanstack/react-router';
import { McpInstallPage } from '@/components/Mcp/InstallPage';

export const Route = createFileRoute('/mcp')({
   beforeLoad: () => ({ getLabel: () => 'MCP' }),
   component: McpInstallPage,
});
