import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import * as schemas from '#models';

export default (options: any) => {
   const registry = new OpenAPIRegistry();

   //Auth Schemas
   registry.registerComponent('securitySchemes', 'JWT', {
      type: 'oauth2',
      description: 'Using OAuth2 for password validation flow of generating jwt',
      flows: {
         implicit: {
            authorizationUrl: '/api/v1/login/:jwt',
         },
      },
   });
   //
   //components:
   //  securitySchemes:
   //    oAuth2Password:
   //      type: oauth2
   //      description: See https://developers.getbase.com/docs/rest/articles/oauth2/requests
   //      flows:
   //        password:
   //          tokenUrl: https://api.getbase.com/oauth2/token

   registry.register('JwtPayload', schemas.JwtPayload);
   registry.register('Login', schemas.LoginSchema);

   //enums Schemas
   registry.register('Major', schemas.MajorSchema);
   registry.register('Minor', schemas.MinorSchema);
   registry.register('Location', schemas.LocationSchema);
   registry.register('CoopYear', schemas.CoopYearSchema);
   registry.register('CoopCycle', schemas.CoopCycleSchema);
   registry.register('ProgramLevel', schemas.ProgramLevelSchema);

   //postion Schemas
   registry.register('Company', schemas.CompanySchema);
   registry.register('CompanyInsert', schemas.CompanyInsertSchema);

   registry.register('Position', schemas.PositionSchema);
   registry.register('PositionInsert', schemas.PositionInsertSchema);

   ////User Schemas
   //registry.register("User", schemas.UserSchema);
   //registry.register("UserInsert", schemas.UserInsertSchema);
   //registry.register("UserUpdate", schemas.UserUpdateSchema);
   //
   //registry.register("ProfileMajor", schemas.ProfileMajorSchema);
   //registry.register("ProfileMajorInsert", schemas.ProfileMajorInsertSchema);
   //registry.register("ProfileMajorUpdate", schemas.ProfileMajorUpdateSchema);
   //
   //registry.register("ProfileMinor", schemas.ProfileMinorSchema);
   //registry.register("ProfileMinorInsert", schemas.ProfileMinorInsertSchema);
   //registry.register("ProfileMinorUpdate", schemas.ProfileMinorUpdateSchema);

   //Company Schemas
   registry.register(
      'CompanyPositionInsert',
      schemas.CompanyPositionInsertSchema,
   );
   registry.register('CompanyInsert', schemas.CompanyInsertSchema);
   //Submission Schemas
   registry.register('Submission', schemas.SubmissionSchema);
   registry.register('SubmissionAggregate', schemas.SubmissionAggregateSchema);
   registry.register(
      'SubmissionAggregateUpdate',
      schemas.SubmissionAggregateUpdateSchema,
   );
   registry.register('SubmissionInsert', schemas.SubmissionInsertSchema);
   registry.register('SubmissionMeIds', schemas.SubmissionMeIdsSchema);
   registry.register('SubmissionUpdate', schemas.SubmissionUpdateSchema);
   registry.register('SubmissionQuery', schemas.SubmissionQuerySchema);

   //Submission Responses Schemas
   registry.register('SubmissionResponse', schemas.SubmissionResponseSchema);

   const generator = new OpenApiGeneratorV3(registry.definitions);

   return generator.generateDocument(options);
};
