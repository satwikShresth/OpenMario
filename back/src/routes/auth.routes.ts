import { Response, Router } from "express";
import {
  validateUser,
  zodBodyValidator,
  zodParamsValidator,
} from "#/middleware/validation.middleware.ts";
import { emailService } from "#/services/mail.service.ts";
import { LoginSchema, RequestParamsId } from "#models";
import { db, users } from "#db";
import * as config from "#/config/index.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sign, verify } from "jsonwebtoken";

export default () => {
  const router = Router();

  const createMagicLink = (token: string): string =>
    `${config.APP_URL}api/v1/auth/login/${token}`;

  /**
   * POST /auth/login
   * @summary Request a magic link for authentication
   * @tags Auth
   * @param {Login} request.body.required - User email
   * @return {object} 200 - Success response
   * @example request - Example request
   * {"email": "user@example.com"}
   * @example response - 200 - Example success response
   * {
   *   "message": "Magic link sent to your email"
   * }
   * @return {object} 400 - Error response
   * @example response - 400 - Example error response
   * {
   *   "message": "Email is required"
   * }
   * @return {object} 409 - Database or email error
   * @example response - 409 - Example error response
   * {
   *   "message": "Failed to send email"
   * }
   */
  router.post(
    "/login",
    zodBodyValidator(
      LoginSchema.transform(({ email }) => ({
        email,
        username: email.split("@")[0],
      })),
    ),
    async (req: RequestParamsId, res: Response) => {
      const { email, username } = req?.validated?.body;
      const token = await sign({ email, username }, config.JWT_MAGIC_SECRET, {
        expiresIn: config.JWT_MAGIC_EXPIRE,
        noTimestamp: true,
      });

      const magiclink = createMagicLink(token);
      return (await emailService.sendVerificationEmail(email, magiclink))
        ? res.status(200).json({ message: "Magic link sent to your email" })
        : res.status(409).json({ message: "Failed to send email" });
    },
  );

  /**
   * GET /auth/login/{token}
   * @summary Verify magic link token and authenticate user
   * @tags Auth
   * @param {string} token.path.required - Magic link token
   * @return {object} 200 - Success response with access token
   * @example response - 200 - Example success response
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "token_type": "bearer"
   * }
   * @return {object} 401 - Invalid token response
   * @example response - 401 - Example invalid token
   * {
   *   "message": "Invalid or expired token"
   * }
   * @return {object} 409 - Error response
   */
  router.get(
    "/login/:token",
    zodParamsValidator(
      z.object({ token: z.string() }).transform(async ({ token }) => {
        console.log(token);
        return await verify(token, config.JWT_MAGIC_SECRET);
      }),
    ),
    async (req: RequestParamsId, res: Response) => {
      console.log(req?.validated?.params);
      const { email, username } = req?.validated?.params;

      return await db
        .select({ id: users.id, username: users.username, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .then(async ([existingUser]) =>
          existingUser
            ? existingUser
            : await db
                .insert(users)
                .values({ username, email })
                .returning()
                .then(([newUsers]) => newUsers),
        )
        .then(({ username, email, id: user_id }) =>
          res.status(200).json({
            access_token: sign(
              {
                user_id,
                username,
                email,
              },
              config.JWT_CLIENT_SECRET,
              { expiresIn: config.JWT_CLIENT_EXPIRE },
            ),
            token_type: "bearer",
          }),
        )
        .catch((error) => {
          console.log(`Error: ${error}`);
          return res.status(409).json({ message: "Failed to Login" });
        });
    },
  );

  ///**
  // * POST /auth/me
  // * @summary Request a magic link for authentication
  // * @tags Auth
  // * @return {object} 200 - Success response
  // * @example response - 200 - Example success response
  // * {
  // *   "username": "something"
  // *   "email": "something@something.com"
  // * }
  // * @return {object} 400 - Error response
  // * @example response - 400 - Example error response
  // * {
  // *   "message": "Email is required"
  // * }
  // * @return {object} 409 - Database or email error
  // * @example response - 409 - Example error response
  // * {
  // *   "message": "Failed to send email"
  // * }
  // */
  //router.post(
  //  "/me",
  //  validateUser,
  //  (req: RequestParamsId, res: Response): Promise<Response> =>
  //    res.status(200).json(req?.auth),
  //);

  return router;
};
