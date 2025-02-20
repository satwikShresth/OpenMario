import * as schemas from '#models';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export default (registry: OpenAPIRegistry) => {
   registry.register('JwtPayload', schemas.JwtPayload);

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
   registry.register('CompanyUpdate', schemas.CompanyUpdateSchema);

   registry.register('Position', schemas.PositionSchema);
   registry.register('PositionInsert', schemas.PositionInsertSchema);
   registry.register('PositionUpdate', schemas.PositionUpdateSchema);

   //User Schemas
   registry.register('User', schemas.UserSchema);
   registry.register('UserInsert', schemas.UserInsertSchema);
   registry.register('UserUpdate', schemas.UserUpdateSchema);

   registry.register('ProfileMajor', schemas.ProfileMajorSchema);
   registry.register('ProfileMajorInsert', schemas.ProfileMajorInsertSchema);
   registry.register('ProfileMajorUpdate', schemas.ProfileMajorUpdateSchema);

   registry.register('ProfileMinor', schemas.ProfileMinorSchema);
   registry.register('ProfileMinorInsert', schemas.ProfileMinorInsertSchema);
   registry.register('ProfileMinorUpdate', schemas.ProfileMinorUpdateSchema);

   //Submission Schemas
   registry.register('Submission', schemas.SubmissionSchema);
   registry.register('SubmissionAggregate', schemas.SubmissionAggregateSchema);
   registry.register('SubmissionInsert', schemas.SubmissionInsertSchema);
   registry.register('SubmissionUpdate', schemas.SubmissionUpdateSchema);
   registry.register('SubmissionQuery', schemas.SubmissionQuerySchema);

   //Submission Responses Schemas
   registry.register('SubmissionResponse', schemas.SubmissionResponseSchema);
};
