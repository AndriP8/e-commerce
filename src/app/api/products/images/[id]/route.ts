import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError } from "@/lib/helpers/error-response";
import { s3ClientConfig } from "@/lib/helpers/s3";
import { verifyToken } from "@/lib/helpers/verify-token";
import { productSchema } from "@/lib/schema/product.schema";

type DeleteImageParams = z.infer<typeof productSchema.deleteImage.params>;
type DeleteImageResponse = z.infer<typeof productSchema.deleteImage.response>;
export async function DELETE(
  request: NextRequest,
  route: { params: DeleteImageParams },
) {
  const token = cookies().get("session")?.value || "";

  try {
    await verifyToken(token);

    const command = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME || "",
      Key: route.params.id,
    });
    await s3ClientConfig.send(command);
    s3ClientConfig.destroy();

    return handleApiData<DeleteImageResponse>(
      {
        data: "OK",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
