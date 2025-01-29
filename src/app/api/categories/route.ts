import { cookies } from "next/headers";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError } from "@/lib/helpers/error-response";
import { verifyToken } from "@/lib/helpers/verify-token";
import { CategorySchema } from "@/lib/schema/categories.schema";

type GetCategoriesResponse = z.infer<typeof CategorySchema.read.response>;

export async function GET() {
  const token = cookies().get("session")?.value || "";

  try {
    await verifyToken(token);

    const categories = await db.selectFrom("categories").selectAll().execute();
    return handleApiData<GetCategoriesResponse>(
      {
        data: categories,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
