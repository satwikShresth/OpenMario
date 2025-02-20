import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { profile_major, profile_minor, users } from '#db';

extendZodWithOpenApi(z);

const username = (schema: any) =>
   schema
      .trim()
      .regex(/^[a-zA-Z\s\-'\p{L}\p{M}]+$/u, {
         message: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods',
      })
      .min(4, 'Full name cannot be less than 4 characters.')
      .max(255, 'Full name cannot exceed 255 characters.');

const password = (schema: any) =>
   schema
      .min(4, 'Password must be at least 4 characters long.')
      .max(40, 'Password cannot be more than 40 characters long.');

export const UserSchema = createSelectSchema(users, { username, password });
export const UserInsertSchema = createInsertSchema(users, {
   username,
   password,
});
export const UserUpdateSchema = createUpdateSchema(users, {
   username,
   password,
});

export type User = z.infer<typeof UserSchema>;
export type UserInsert = z.infer<typeof UserInsertSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export const ProfileMajorSchema = createSelectSchema(profile_major);
export const ProfileMajorInsertSchema = createInsertSchema(profile_major);
export const ProfileMajorUpdateSchema = createUpdateSchema(profile_major);

export type ProfileMajor = z.infer<typeof ProfileMajorSchema>;
export type ProfileMajorInsert = z.infer<typeof ProfileMajorInsertSchema>;
export type ProfileMajorUpdate = z.infer<typeof ProfileMajorUpdateSchema>;

export const ProfileMinorSchema = createSelectSchema(profile_minor);
export const ProfileMinorInsertSchema = createInsertSchema(profile_minor);
export const ProfileMinorUpdateSchema = createUpdateSchema(profile_minor);

export type ProfileMinor = z.infer<typeof ProfileMinorSchema>;
export type ProfileMinorInsert = z.infer<typeof ProfileMinorInsertSchema>;
export type ProfileMinorUpdate = z.infer<typeof ProfileMinorUpdateSchema>;
