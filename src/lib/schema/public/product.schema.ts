import { z } from "zod";

import { categories } from "@/lib/enums/categories";
import { sizes } from "@/lib/enums/sizes";
import { Product } from "@/lib/types/database/products-types";

import { paginationSchema } from "../pagination.schema";
import { SchemaType } from "../schema-types";

type ProductType = Omit<Product, "category_id"> & {
  variants: { size: string; stock: number }[];
  category: {
    name: string;
    id: string;
  };
};

const productData = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  sku: z.string(),
  description: z.string(),
  discount: z.number().nullable(),
  images: z.array(z.string()),
  category: z.object({
    name: z.string(),
    id: z.string(),
  }),
  variants: z.array(
    z.object({
      size_id: z.string(),
      size: z.string(),
      stock: z.number(),
    }),
  ),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
});
productData._output satisfies ProductType;

const productQuery = z.object({
  page: z.number(),
  size: z.number().optional(),
  search: z.string().nullable().optional(),
  categories: z.enum(categories).array().optional(),
  sizes: z.enum(sizes).array().optional(),
  sort_by: z.enum(["price", "created_at"]).optional(),
  sort_direction: z.enum(["asc", "desc"]).optional(),
});

const productParams = z.object({
  id: z.string(),
});

export const publicProductSchema = {
  path: "/public/products",
  read: {
    path: "/",
    query: productQuery,
    response: z.object({
      data: z.array(productData),
      pagination: paginationSchema,
    }),
  },
  readDetail: {
    path: "/:id",
    params: productParams,
    response: z.object({
      data: productData,
    }),
  },
} satisfies Partial<SchemaType>;
