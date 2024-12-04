import { z } from "zod";

import { Users } from "@/lib/types/database/users-types";

import { SchemaType } from "./schema-types";

const registerUserPayload = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
registerUserPayload._output satisfies Pick<Users, "email" | "password">;

const registerUserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  deleted_at: z.string(),
  updated_at: z.string(),
  asd: z.string(),
});
registerUserResponse._output satisfies Omit<Users, "password">;

export const loginSchema = {
  path: "/login",
  create: {
    path: "/",
    body: registerUserPayload,
    response: registerUserResponse,
  },
} satisfies Partial<SchemaType>;
