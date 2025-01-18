import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
   BaseBookQuerySchema as BookQuery,
   BookCreateSchema,
   BookSchema,
   BookUpdateSchema,
   paramsIdSchema as ParamsId,
} from '#models';

export default (registry: OpenAPIRegistry, path: string) => {
   const Book = registry.register('Book', BookSchema);
   const BookCreate = registry.register('BookCreate', BookCreateSchema);
   const BookUpdate = registry.register('BookUpdate', BookUpdateSchema);

   registry.registerPath({
      method: 'get',
      path,
      description: 'Get all books with optional filtering',
      tags: ['Books'],
      request: {
         query: BookQuery,
      },
      responses: {
         200: {
            description: 'List of books matching the criteria',
            content: {
               'application/json': {
                  schema: Book.array(),
               },
            },
         },
      },
   });

   // POST /books - Create new book
   registry.registerPath({
      method: 'post',
      path,
      description: 'Create a new book',
      tags: ['Books'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: BookCreate,
               },
            },
         },
      },
      responses: {
         201: {
            description: 'Book created successfully',
            content: {
               'application/json': {
                  schema: Book,
               },
            },
         },
         400: {
            description: 'Invalid request body',
         },
      },
   });

   // GET /books/{id} - Get book by ID
   registry.registerPath({
      method: 'get',
      path: path + '/{id}',
      description: 'Get a book by its ID',
      tags: ['Books'],
      request: {
         params: ParamsId,
      },
      responses: {
         200: {
            description: 'Book details',
            content: {
               'application/json': {
                  schema: Book,
               },
            },
         },
         404: {
            description: 'Book not found',
         },
      },
   });

   // PUT /books/{id} - Update book
   registry.registerPath({
      method: 'put',
      path: path + '/{id}',
      description: 'Update an existing book',
      tags: ['Books'],
      request: {
         params: ParamsId,
         body: {
            content: {
               'application/json': {
                  schema: BookUpdate,
               },
            },
         },
      },
      responses: {
         200: {
            description: 'Book updated successfully',
            content: {
               'application/json': {
                  schema: Book,
               },
            },
         },
         400: {
            description: 'Invalid request body',
         },
         404: {
            description: 'Book not found',
         },
      },
   });

   // DELETE /books/{id} - Delete book
   registry.registerPath({
      method: 'delete',
      path: path + '/{id}',
      description: 'Delete a book',
      tags: ['Books'],
      request: {
         params: ParamsId,
      },
      responses: {
         204: {
            description: 'Book deleted successfully',
         },
         404: {
            description: 'Book not found',
         },
      },
   });
};
