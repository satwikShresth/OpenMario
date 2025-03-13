import { betterAuth } from "better-auth";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, jwt, openAPI } from "better-auth/plugins";
import { emailService } from "#/services/mail.service.ts";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
    usePlural: true,
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, request) => {
        console.log("email_being_sent");
        const result = await emailService.sendVerificationEmail(email, url);
        console.log(request);
        console.log(result);
      },
    }),
    openAPI({ disableDefaultReference: false }),
    jwt({
      jwt: {
        definePayload: (user) => ({
          id: user.user.id,
          email: user.user.email,
          name: user.user.name,
          is_verified: user.user.emailVerified,
        }),
      },
    }),
  ],
});
