import { z } from "zod";

import { Products } from "@/lib/types/database/products-types";

import { paginationSchema } from "./pagination.schema";
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
  discount: z.number().max(100).nullable(),
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

const productData = z.object({
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
productData._output satisfies GetProduct;

const productQuery = z.object({
  page: z.number(),
  size: z.number(),
  search: z.string().nullable(),
});

const productParams = z.object({
  id: z.string(),
});

const uploadImagePayload = z.object({
  filename: z.string(),
  size: z.number(),
  content_type: z.string(),
});
const uploadImageResponse = z.object({ signed_url: z.string() });

const deleteImageParams = z.object({
  id: z.string(),
});

export const productSchema = {
  path: "/product",
  create: {
    path: "/",
    body: createProductPayload,
    response: z.object({
      data: createProductPayload,
    }),
  },
  read: {
    path: "/",
    query: productQuery,
    response: z.object({
      data: z.array(productData),
      pagination: paginationSchema,
    }),
  },
  update: {
    path: "/:id",
    params: productParams,
    body: createProductPayload,
    response: z.object({
      data: createProductPayload,
    }),
  },
  readDetail: {
    path: "/:id",
    params: productParams,
    response: z.object({
      data: productData,
    }),
  },
  delete: {
    path: "/:id",
    params: productParams,
    response: z.object({
      data: z.literal("OK"),
    }),
  },
  uploadImage: {
    path: "/images",
    body: uploadImagePayload,
    response: z.object({
      data: uploadImageResponse,
    }),
  },
  deleteImage: {
    path: "/images/:id",
    params: deleteImageParams,
    response: z.object({
      data: z.literal("OK"),
    }),
  },
} satisfies Partial<SchemaType>;
