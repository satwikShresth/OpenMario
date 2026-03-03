import { env } from '@env';

const ALLOWED_ORIGINS = {
   staging: [
      'https://openmario.app',
   ],
   production: [
      'https://openmario.app',
      'https://www.openmario.app',
   ]
};

export const CORS_OPTIONS = {
   origin: (['staging', 'production'] as const).includes(env.NODE_ENV as 'staging' | 'production')
      ? ALLOWED_ORIGINS[env.NODE_ENV as keyof typeof ALLOWED_ORIGINS]
      : ['http://localhost:5173'],
   credentials: true,
   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowHeaders: ['Content-Type', 'Authorization'],
   exposeHeaders: ['Content-Length'],
   maxAge: 600
};
