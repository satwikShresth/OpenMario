import { contract } from '@/contracts';
import { implement } from '@orpc/server';

export const os = implement(contract);
