import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { emailService } from "#/services/mail.service.ts";
import { LoginSchema } from "#models";
import { db, users } from "#db";
import { eq } from "drizzle-orm";
import { sign, verify } from "jsonwebtoken";
import { meilisearchService } from "#/services/meilisearch.service.ts";
import {
  DescribeRouteBase,
  DescribleRoute,
  ErrorResponseSchema,
  SuccessResponseSchema,
} from "#models";

// Define response schemas for auth routes
const SearchTokenResponseSchema = z
  .object({
    token: z.string(),
  })
  .meta({ id: "SearchTokenResponse" });

const LoginResponseSchema = z
  .object({
    access_token: z.string(),
    token_type: z.string(),
  })
  .meta({ id: "LoginResponse" });

const TokenErrorResponseSchema = z
  .object({
    message: z.string(),
    details: z.string(),
  })
  .meta({ id: "TokenErrorResponse" });

// Single helper function for all auth route descriptions
const DescribeAuthRoute = ({
  description,
  tags = ["Auth"],
  responses = {},
}: DescribleRoute) =>
  DescribeRouteBase({
    description,
    tags,
    responses: {
      "200": {
        description: "Success",
        schema: SuccessResponseSchema,
      },
      "401": {
        description: "Unauthorized",
        schema: TokenErrorResponseSchema,
      },
      "409": {
        description: "Conflict",
        schema: ErrorResponseSchema,
      },
      "500": {
        description: "Internal server error",
        schema: ErrorResponseSchema,
      },
      ...responses,
    },
  });

export default () => {
  const router = new Hono().basePath("/auth");

  /**
   * GET /auth/search-token
   * Get a tenant token for searching, filtering, and sorting (expires in 1 day)
   */
  router.get(
    "/search-token",
    DescribeAuthRoute({
      description:
        "Get a tenant token for searching, filtering, and sorting (expires in 1 day)",
      tags: ["Meilisearch"],
      responses: {
        "200": {
          description: "Successfully generated tenant token",
          schema: SearchTokenResponseSchema,
        },
      },
    }),
    async (c) =>
      await meilisearchService
        .getTenantToken()
        .then((token) =>
          !token
            ? c.json({ message: "Failed to generate tenant token" }, 500)
            : c.json({ token }, 200)
        )
        .catch((error) => {
          console.error("Error generating Meilisearch tenant token:", error);
          return c.json({ message: "Internal server error" }, 500);
        }),
  );

  /**
   * POST /auth/login
   * Request a magic link for authentication
   */
  router.post(
    "/login",
    DescribeAuthRoute({
      description: "Request a magic link for authentication",
      responses: {
        "200": {
          description: "Magic link sent successfully",
          schema: SuccessResponseSchema,
        },
      },
    }),
    zValidator(
      "json",
      LoginSchema.transform(({ email }) => ({
        email,
        username: email.split("@")[0],
      })),
    ),
    async (c) => {
      const { email, username } = c.req.valid("json");
      const token = await sign(
        { email, username },
        Deno.env.get("JWT_MAGIC_SECRET")!,
        {
          expiresIn: Deno.env.get("JWT_MAGIC_EXPIRE")!,
          noTimestamp: true,
        },
      );
      return (await emailService.sendVerificationEmail(email, token))
        ? c.json({ message: "Magic link sent to your email" }, 200)
        : c.json({ message: "Failed to send email" }, 409);
    },
  );

  /**
   * GET /auth/login/{token}
   * Verify magic link token and authenticate user
   */
  router.get(
    "/login/:token",
    DescribeAuthRoute({
      description: "Verify magic link token and authenticate user",
      responses: {
        "200": {
          description: "User authenticated successfully",
          schema: LoginResponseSchema,
        },
      },
    }),
    zValidator("param", z.object({ token: z.string() })),
    async (c) => {
      const token = c.req.param("token");
      let decodedToken;
      try {
        decodedToken = await verify(token, Deno.env.get("JWT_MAGIC_SECRET")!);
      } catch (error) {
        return c.json(
          //@ts-ignore: I duuno why
          { message: "Invalid or expired token", details: error.message },
          401,
        );
      }
      const { email, username } = decodedToken as {
        email: string;
        username: string;
      };
      return await db
        .select({ id: users.id, username: users.username, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .then(async (existingUsers) => {
          if (existingUsers.length > 0) {
            return existingUsers[0];
          }
          return await db
            .insert(users)
            .values({ username, email })
            .returning()
            .then(([newUser]) => newUser);
        })
        .then(({ username, email, id: user_id }) =>
          c.json(
            {
              access_token: sign(
                {
                  user_id,
                  username,
                  email,
                },
                Deno.env.get("JWT_CLIENT_SECRET")!,
                { expiresIn: Deno.env.get("JWT_CLIENT_EXPIRE") },
              ),
              token_type: "bearer",
            },
            200,
          )
        )
        .catch((error) => {
          console.log(`Error: ${error}`);
          return c.json({ message: "Failed to Login" }, 409);
        });
    },
  );

  return router;
};
