import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export default (
   registry: OpenAPIRegistry,
   path: string,
   auth: { name: string; ref: { $ref: string } },
) => {
   const User = registry.register('User', UserSchema);
   const UserCreate = registry.register('UserCreate', UserCreateSchema);

   registry.registerPath({
      method: 'post',
      path: path + '/signup',
      description: 'Register a new user',
      tags: ['Authentication'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: UserCreate,
               },
            },
         },
      },
      responses: {
         201: {
            description: 'User created successfully',
            content: {
               'application/json': {
                  schema: User,
               },
            },
         },
         409: { description: 'Username already exists' },
      },
   });

   registry.registerPath({
      method: 'post',
      path: path + '/me',
      security: [{ [auth.name]: [] }],
      description: 'Logout user and invalidate tokens',
      tags: ['Authentication'],
      responses: {
         200: {
            description: 'Decoded Token',
            content: {
               'application/json': {
                  schema: User,
               },
            },
         },
         401: { description: 'Invalid token' },
      },
   });

   registry.registerPath({
      method: 'post',
      path: path + '/logout',
      security: [{ [auth.name]: [] }],
      description: 'Logout user and invalidate tokens',
      tags: ['Authentication'],
      responses: {
         200: { description: 'Successfully logged out' },
         401: { description: 'Invalid token' },
      },
   });

   registry.registerPath({
      method: 'post',
      path: path + '/access-token',
      description: 'Authorize user credentials',
      tags: ['Authentication'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: User,
               },
            },
         },
      },
      responses: {
         200: {
            description: 'Authorization successful',
            content: {
               'application/json': {
                  schema: z.object({
                     type: z.string(),
                     token: z.string().openapi({
                        description: 'JWT Bearer token',
                     }),
                  }).openapi({
                     title: 'AuthResponse',
                     description:
                        'Authentication response with user data and JWT token',
                  }),
               },
            },
         },
         401: { description: 'Invalid credentials' },
         404: { description: 'Username not found' },
      },
   });
};
