import { z } from "zod";

import { CreateBuyer } from "@/lib/types/database/buyers-types";

import { SchemaType } from "../schema-types";

const loginBuyerBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
loginBuyerBody._output satisfies Omit<CreateBuyer, "name">;

export const publicLoginSchema = {
  path: "/public/login",
  create: {
    path: "/",
    body: loginBuyerBody,
    response: z.object({
      data: z.object({
        token: z.string(),
      }),
    }),
  },
} satisfies Partial<SchemaType>;
