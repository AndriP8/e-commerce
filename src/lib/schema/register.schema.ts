import { z } from "zod";

import { Users } from "@/lib/types/database/users-types";

import { SchemaType } from "./schema-types";

const registerUserPayload = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const registerUserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  deleted_at: z.string(),
  updated_at: z.string(),
});
registerUserResponse._output satisfies Omit<Users, "password">;

export const registerSchema = {
  path: "/register",
  create: {
    path: "/",
    body: registerUserPayload,
    response: registerUserResponse,
  },
} satisfies Partial<SchemaType>;
