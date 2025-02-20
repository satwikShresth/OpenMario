import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import {
   BaseSubmissionQuerySchema,
   paramsIdSchema as ParamsId,
   SubmissionAggregateSchema,
   SubmissionAggregateUpdateSchema,
} from '#models';

export default (
   registry: OpenAPIRegistry,
   path: string,
   //auth: { name: string; ref: { $ref: string } },
) => {
   const Submission = registry.register(
      'Submission',
      SubmissionAggregateSchema,
   );
   const SubmissionCreate = registry.register(
      'SubmissionCreate',
      SubmissionAggregateSchema,
   );
   const SubmissionUpdate = registry.register(
      'SubmissionUpdate',
      SubmissionAggregateUpdateSchema,
   );

   registry.registerPath({
      method: 'get',
      path,
      description: 'Get all submissions with optional filtering',
      //security: [{ [auth.name]: [] }],
      tags: ['Submissions'],
      request: {
         query: BaseSubmissionQuerySchema,
      },
      responses: {
         200: {
            description: 'List of submissions matching the criteria',
            content: {
               'application/json': {
                  schema: Submission.array(),
               },
            },
         },
      },
   });

   // POST /submissions - Create new submission
   registry.registerPath({
      method: 'post',
      path,
      description: 'Create a new submission',
      //security: [{ [auth.name]: [] }],
      tags: ['Submissions'],
      request: {
         body: {
            content: {
               'application/json': {
                  schema: SubmissionCreate,
               },
            },
         },
      },
      responses: {
         201: {
            description: 'Submission created successfully',
            content: {
               'application/json': {
                  schema: Submission,
               },
            },
         },
         400: {
            description: 'Invalid request body',
         },
      },
   });

   // GET /submissions/{id} - Get submission by ID
   registry.registerPath({
      method: 'get',
      path: path + '/{id}',
      //security: [{ [auth.name]: [] }],
      description: 'Get a submission by its ID',
      tags: ['Submissions'],
      request: {
         params: ParamsId,
      },
      responses: {
         200: {
            description: 'Submission details',
            content: {
               'application/json': {
                  schema: Submission,
               },
            },
         },
         404: {
            description: 'Submission not found',
         },
      },
   });

   // PUT /submissions/{id} - Update submission
   registry.registerPath({
      method: 'put',
      path: path + '/{id}',
      //security: [{ [auth.name]: [] }],
      description: 'Update an existing submission',
      tags: ['Submissions'],
      request: {
         params: ParamsId,
         body: {
            content: {
               'application/json': {
                  schema: SubmissionUpdate,
               },
            },
         },
      },
      responses: {
         200: {
            description: 'Submission updated successfully',
            content: {
               'application/json': {
                  schema: Submission,
               },
            },
         },
         400: {
            description: 'Invalid request body',
         },
         404: {
            description: 'Submission not found',
         },
      },
   });
};
