import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { ValidationError, onError, ORPCError } from '@orpc/server';
import { SmartCoercionPlugin } from '@orpc/json-schema';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import {
   CORSPlugin,
   ResponseHeadersPlugin,
   RequestHeadersPlugin
} from '@orpc/server/plugins';
import { router } from '@/router';
import { z } from 'zod';
import { CORS_OPTIONS } from './cors';

export const handler = new OpenAPIHandler(router, {
   plugins: [
      new CORSPlugin(CORS_OPTIONS),
      new SmartCoercionPlugin({
         schemaConverters: [new ZodToJsonSchemaConverter()]
      }),
      new RequestHeadersPlugin(),
      new ResponseHeadersPlugin()
   ],

   interceptors: [
      onError(error => {
         console.log(error);
         if (
            error instanceof ORPCError &&
            error.code === 'BAD_REQUEST' &&
            error.cause instanceof ValidationError
         ) {
            // If you only use Zod you can safely cast to ZodIssue[]
            const zodError = new z.ZodError(
               error.cause.issues as z.core.$ZodIssue[]
            );

            throw new ORPCError('INPUT_VALIDATION_FAILED', {
               status: 422,
               message: z.prettifyError(zodError),
               data: z.flattenError(zodError),
               cause: error.cause
            });
         }

         if (
            error instanceof ORPCError &&
            error.code === 'INTERNAL_SERVER_ERROR' &&
            error.cause instanceof ValidationError
         ) {
            // If you only use Zod you can safely cast to ZodIssue[]
            const zodError = new z.ZodError(
               error.cause.issues as z.core.$ZodIssue[]
            );

            console.log(z.prettifyError(zodError));
            throw new ORPCError('OUTPUT_VALIDATION_FAILED', {
               cause: error.cause
            });
         }
      })
   ]
});
