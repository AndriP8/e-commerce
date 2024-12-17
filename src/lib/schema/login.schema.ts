import { z } from "zod";

import { Users } from "@/lib/types/database/users-types";

import { SchemaType } from "./schema-types";

const registerUserPayload = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
registerUserPayload._output satisfies Pick<Users, "email" | "password">;

const registerUserResponse = z.object({
  token: z.string(),
});

export const loginSchema = {
  path: "/login",
  create: {
    path: "/",
    body: registerUserPayload,
    response: z.object({
      data: registerUserResponse,
    }),
  },
} satisfies Partial<SchemaType>;
