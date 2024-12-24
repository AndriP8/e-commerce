import { z } from "zod";

export const paginationSchema = z.object({
  size: z.number(),
  page: z.number(),
  totalSize: z.number(),
  totalPages: z.number(),
});
