import { createCli } from 'trpc-cli';
import { router } from './procedures';

createCli({ router }).run();
