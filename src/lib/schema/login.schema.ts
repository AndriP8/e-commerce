import { z } from "zod";

import { Users } from "@/lib/types/database/users-types";

import { SchemaType } from "./schema-types";

const registerUserBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
registerUserBody._output satisfies Pick<Users, "email" | "password">;

export const loginSchema = {
  path: "/login",
  create: {
    path: "/",
    body: registerUserBody,
    response: z.object({
      data: z.literal("OK"),
    }),
  },
} satisfies Partial<SchemaType>;
