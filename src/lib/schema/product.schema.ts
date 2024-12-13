import { z } from "zod";

import { Products } from "@/lib/types/database/products-types";

import { SchemaType } from "./schema-types";

type ProductSize = {
  size_id: string;
  stock: number;
};
type CreateProduct = Omit<
  Products,
  "id" | "created_at" | "updated_at" | "deleted_at"
> & { variants: ProductSize[] };

type GetProduct = Omit<Products, "category_id"> & {
  variants: { size: string; stock: number }[];
  category_name: string;
};

export const sizes = ["S", "M", "L", "XL", "XXL"] as const;

const createProductPayload = z.object({
  name: z.string(),
  price: z.number(),
  sku: z.string(),
  description: z.string(),
  discount: z.number().nullable(),
  images: z
    .array(z.string())
    .min(1, { message: "Please add at least one image" }),
  category_id: z.string(),
  variants: z
    .array(
      z.object({
        size_id: z.string(),
        stock: z.number(),
      }),
    )
    .min(1, { message: "Please add at least one variant" }),
});
createProductPayload._output satisfies CreateProduct;

const productResponse = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  sku: z.string(),
  description: z.string(),
  discount: z.number().nullable(),
  images: z.array(z.string()),
  category_name: z.string(),
  variants: z.array(
    z.object({
      size: z.string(),
      stock: z.number(),
    }),
  ),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
});
productResponse._output satisfies GetProduct;

const productParams = z.object({
  id: z.string(),
});

export const productSchema = {
  path: "/product",
  create: {
    path: "/",
    body: createProductPayload,
    response: createProductPayload,
  },
  read: {
    path: "/",
    response: z.array(productResponse),
  },
  update: {
    path: "/:id",
    params: productParams,
    body: createProductPayload,
    response: createProductPayload,
  },
  readDetail: {
    path: "/:id",
    params: productParams,
    response: productResponse,
  },
  delete: {
    path: "/:id",
    params: productParams,
    response: z.literal("OK"),
  },
} satisfies Partial<SchemaType>;
