import { env } from '@env';

const allowedOrigins = env.CORS_ORIGINS.split(',')
   .map(origin => origin.trim())
   .filter(Boolean);

export const CORS_OPTIONS = {
   origin: allowedOrigins,
   credentials: true,
   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowHeaders: ['Content-Type', 'Authorization'],
   exposeHeaders: ['Content-Length'],
   maxAge: 600
};
