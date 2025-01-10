import { z } from "zod";

import { Category } from "@/lib/types/database/categories-types";

import { SchemaType } from "./schema-types";

const categoryData = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),

  deleted_at: z.string().nullable(),
});
categoryData._output satisfies Category;

export const CategorySchema = {
  path: "/categories",
  read: {
    path: "/",
    response: z.object({ data: z.array(categoryData) }),
  },
} satisfies Partial<SchemaType>;
