import { z } from "zod";

import { CreateProduct, Product } from "@/lib/types/database/products-types";

import { paginationSchema } from "./pagination.schema";
import { SchemaType } from "./schema-types";

type ProductSize = {
  size_id: string;
  stock: number;
};
type CreateProducts = CreateProduct & { variants: ProductSize[] };

type ProductType = Omit<Product, "category_id"> & {
  variants: { size_id: string; stock: number }[];
  category: {
    name: string;
    id: string;
  };
};

const createProductBody = z.object({
  name: z.string(),
  price: z.number(),
  sku: z.string(),
  description: z.string(),
  discount: z.number().min(0).max(100).nullable(),
  images: z
    .array(z.string())
    .min(1, { message: "Please add at least one uploaded image" })
    .max(4, { message: "You can add up to 4 images" }),
  category_id: z.string(),
  variants: z
    .array(
      z.object({
        size_id: z.string().min(1, { message: "Required" }),
        stock: z.number().min(1),
      }),
    )
    .min(1, { message: "Please add at least one variant" })
    .max(4, { message: "You can add up to 4 variants" })
    .refine(
      (variants) => {
        const sizeIds = variants.map((variant) => variant.size_id);
        return new Set(sizeIds).size === sizeIds.length;
      },
      { message: "You can't add duplicate size" },
    ),
});
createProductBody._output satisfies CreateProducts;

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
  size: z.number(),
  search: z.string().nullable(),
});

const productParams = z.object({
  id: z.string(),
});

const uploadImageBody = z.object({
  id: z.string(),
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
    body: createProductBody,
    response: z.object({
      data: createProductBody,
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
    body: createProductBody,
    response: z.object({
      data: createProductBody,
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
    body: uploadImageBody,
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
