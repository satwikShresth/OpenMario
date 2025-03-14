import { betterAuth } from "better-auth";
import { db } from "../db/index.ts";
import * as schema from "../db/schema.ts";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink, openAPI } from "better-auth/plugins";
import { emailService } from "#/services/mail.service.ts";

const path = "/api/auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: false,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
    usePlural: true,
  }),
  disabledPaths: [
    "/api/auth/signup",
    "/api/auth/signin/email",
    "/api/auth/ok",
    `${path}/signup`,
    `${path}/signin/email`,
    `${path}/signup/email`,
    `${path}/forget-password`,
    `${path}/update-password`,
    `${path}/reset-password`,
    `${path}/unlink-accounts`,
    `${path}/delete-user`,
    `${path}/delete-user/callback`,
    `${path}/delete-user/list-accounts`,
    `${path}/delete-user/link-social`,
    `${path}/delete-user/reset-password/{token}`,
  ],
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
  ],
});
