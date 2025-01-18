import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
   AuthorCreateSchema,
   AuthorSchema,
   AuthorUpdateSchema,
   BaseAuthorQuerySchema,
   paramsIdSchema,
} from '#models';
import { z } from 'zod';

export default (registry: OpenAPIRegistry, path: string) => {
   const Author = registry.register('Author', AuthorSchema);
   const AuthorCreate = registry.register('AuthorCreate', AuthorCreateSchema);
   const AuthorUpdate = registry.register('AuthorUpdate', AuthorUpdateSchema);
   const AuthorQuery = registry.register('AuthorQuery', BaseAuthorQuerySchema);
   const ParamsId = registry.register('ParamsId', paramsIdSchema);

   registry.registerPath({
      method: 'get',
      path,
      description: 'Get all authors',
      tags: ['Authors'],
      request: {
         query: AuthorQuery,
      },
      responses: {
         200: {
            description: 'Success',
            content: {
               'application/json': {
                  schema: Author.array(),
               },
            },
         },
      },
   });

   registry.registerPath({
      method: 'post',
      path,
      description: 'Create an author',
      tags: ['Authors'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: AuthorCreate,
               },
            },
         },
      },
      responses: {
         201: {
            description: 'Created',
            content: {
               'application/json': {
                  schema: Author,
               },
            },
         },
      },
   });

   registry.registerPath({
      method: 'get',
      path: path + '/{id}',
      description: 'Get author by id',
      tags: ['Authors'],
      request: {
         params: ParamsId,
      },
      responses: {
         200: {
            description: 'Success',
            content: { 'application/json': { schema: Author } },
         },
         404: { description: 'Not found' },
      },
   });

   registry.registerPath({
      method: 'put',
      path: path + '/{id}',
      description: 'Update an author',
      tags: ['Authors'],
      request: {
         params: ParamsId,
         body: {
            content: {
               'application/json': {
                  schema: AuthorUpdate,
               },
            },
         },
      },
      responses: {
         200: {
            description: 'Success',
            content: {
               'application/json': {
                  schema: Author,
               },
            },
         },
         404: { description: 'Not found' },
      },
   });

   registry.registerPath({
      method: 'delete',
      path: path + '/{id}',
      description: 'Delete an author',
      tags: ['Authors'],
      request: {
         params: ParamsId,
      },
      responses: {
         200: {
            description: 'Success',
            content: {
               'application/json': {
                  schema: z.object({
                     deleted_id: z.number(),
                  }).openapi({
                     title: 'DeletedAuthor',
                     description:
                        'Response containing the ID of the deleted author',
                  }),
               },
            },
         },
         404: { description: 'Not found' },
      },
   });
};
