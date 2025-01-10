import { z } from "zod";

import { Size } from "@/lib/types/database/sizes-types";

import { SchemaType } from "./schema-types";

const sizeData = z.object({
  id: z.string(),
  size: z.string(),
  order: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
sizeData._output satisfies Size;

export const sizeSchema = {
  path: "/sizes",
  read: {
    path: "/",
    response: z.object({ data: z.array(sizeData) }),
  },
} satisfies Partial<SchemaType>;
