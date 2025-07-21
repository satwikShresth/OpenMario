import { Hono } from 'hono';
import { validator as zValidator } from 'hono-openapi/zod';
import { company, db, position } from '#db';
import {
   CompanyCreateResponseSchema,
   CompanyInsertSchema,
   DescribeRouteBase,
   type DescribleRoute,
   ErrorResponseSchema,
   PositionCreateResponseSchema,
   PositionInsertSchema,
} from '#models';

const DescribeCompanyRoute = ({
   description,
   tags = ['Companies'],
   responses = {},
}: DescribleRoute) =>
   DescribeRouteBase({
      description,
      tags,
      responses: {
         '409': {
            description: 'Error response',
            schema: ErrorResponseSchema,
         },
         ...responses,
      },
   });

const DescribePositionRoute = ({
   description,
   tags = ['Positions'],
   responses = {},
}: DescribleRoute) =>
   DescribeRouteBase({
      description,
      tags,
      responses: {
         '409': {
            description: 'Error response',
            schema: ErrorResponseSchema,
         },
         ...responses,
      },
   });

export default () => {
   const router = new Hono();

   /**
    * POST /company
    * Create a new company using database transaction
    */
   router.post(
      '/company',
      DescribeCompanyRoute({
         description: 'Create a new company',
         responses: {
            '201': {
               description: 'Successfully created company',
               schema: CompanyCreateResponseSchema,
            },
            '409': {
               description: 'Error response - company creation failed',
               schema: ErrorResponseSchema,
            },
         },
      }),
      zValidator('json', CompanyInsertSchema),
      async (c) => {
         const user_id = c.get('jwtPayload')?.user_id || null;
         const { name: company_name } = c.req.valid('json');

         return await db
            .transaction(
               async (tx) =>
                  await tx
                     .insert(company)
                     .values({ name: company_name, owner_id: user_id })
                     .returning({
                        id: company.id,
                        name: company.name,
                        owner_id: company.owner_id,
                     }),
            )
            .then(([newCompany]) => {
               return c.json(
                  {
                     company: newCompany,
                     message: 'Company created successfully',
                  },
                  201,
               );
            })
            .catch((error) => {
               console.log(`Error: ${error}`);
               return c.json(
                  {
                     message: `Error: ${error?.message || 'Company creation failed'}`,
                  },
                  409,
               );
            });
      },
   );

   /**
    * POST /position
    * Create a new position using database transaction
    */
   router.post(
      '/position',
      DescribePositionRoute({
         description: 'Create a new position for an existing company',
         responses: {
            '200': {
               description: 'Successfully created position',
               schema: PositionCreateResponseSchema,
            },
            '201': {
               description: 'Successfully created position',
               schema: PositionCreateResponseSchema,
            },
            '409': {
               description: 'Error response - position creation failed',
               schema: ErrorResponseSchema,
            },
         },
      }),
      zValidator('json', PositionInsertSchema),
      async (c) => {
         const user_id = c.get('jwtPayload')?.user_id || null;
         const { name: position_name, company_id } = c.req.valid('json');

         return await db
            .transaction(
               async (tx) =>
                  await tx
                     .insert(position)
                     .values({
                        name: position_name,
                        company_id,
                        owner_id: user_id,
                     })
                     .returning({
                        id: position.id,
                        name: position.name,
                        company_id: position.company_id,
                        owner_id: position.owner_id,
                     }),
            )
            .then(([newPosition]) => {
               return c.json(
                  {
                     position: newPosition,
                     message: 'Position created successfully',
                  },
                  201,
               );
            })
            .catch((error) => {
               console.log(`Error: ${error}`);
               return c.json(
                  {
                     message: `Error: ${error?.message || 'Position creation failed'}`,
                  },
                  409,
               );
            });
      },
   );

   return router;
};
