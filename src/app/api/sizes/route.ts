import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError } from "@/lib/helpers/error-response";
import { verifyToken } from "@/lib/helpers/verify-token";
import { sizeSchema } from "@/lib/schema/sizes.schema";

type GetSizesResponse = z.infer<typeof sizeSchema.read.response>;
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization") || "";

  try {
    await verifyToken(token);
    const sizes = await db
      .selectFrom("sizes")
      .orderBy("order")
      .selectAll()
      .execute();
    return handleApiData<GetSizesResponse>(
      {
        data: sizes,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
