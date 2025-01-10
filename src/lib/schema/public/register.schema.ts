import { z } from "zod";

import { CreateBuyer } from "@/lib/types/database/buyers-types";

import { SchemaType } from "../schema-types";

const registerBuyerBody = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});
registerBuyerBody._output satisfies CreateBuyer;

export const publicRegisterSchema = {
  path: "/public/register",
  create: {
    path: "/",
    body: registerBuyerBody,
    response: z.object({
      data: z.literal("OK"),
    }),
  },
} satisfies Partial<SchemaType>;
