import { z } from 'zod';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { profile_major, profile_minor, users } from '#db';

export const UserSchema = createSelectSchema(users).meta({ id: 'User' });

export const UserInsertSchema = createInsertSchema(users).meta({
   id: 'UserInsert',
});
export const UserUpdateSchema = createUpdateSchema(users).meta({
   id: 'UserUpdate',
});

export const ProfileMajorSchema = createSelectSchema(profile_major).meta({
   id: 'ProfileMajor',
});
export const ProfileMajorInsertSchema = createInsertSchema(profile_major).meta({
   id: 'ProfileMajorInsert',
});
export const ProfileMajorUpdateSchema = createUpdateSchema(profile_major).meta({
   id: 'ProfileMajorUpdate',
});

export const ProfileMinorSchema = createSelectSchema(profile_minor).meta({
   id: 'ProfileMinor',
});
export const ProfileMinorInsertSchema = createInsertSchema(profile_minor).meta({
   id: 'ProfileMinorInsert',
});
export const ProfileMinorUpdateSchema = createUpdateSchema(profile_minor).meta({
   id: 'ProfileMinorUpdate',
});

export type User = z.infer<typeof UserSchema>;
export type UserInsert = z.infer<typeof UserInsertSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export type ProfileMajor = z.infer<typeof ProfileMajorSchema>;
export type ProfileMajorInsert = z.infer<typeof ProfileMajorInsertSchema>;
export type ProfileMajorUpdate = z.infer<typeof ProfileMajorUpdateSchema>;

export type ProfileMinor = z.infer<typeof ProfileMinorSchema>;
export type ProfileMinorInsert = z.infer<typeof ProfileMinorInsertSchema>;
export type ProfileMinorUpdate = z.infer<typeof ProfileMinorUpdateSchema>;
