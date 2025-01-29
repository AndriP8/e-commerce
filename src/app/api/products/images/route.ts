import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { s3ClientConfig } from "@/lib/helpers/s3";
import { validateBody } from "@/lib/helpers/validate-body";
import { verifyToken } from "@/lib/helpers/verify-token";
import { productSchema } from "@/lib/schema/product.schema";

type UploadImageBody = z.infer<typeof productSchema.uploadImage.body>;
type UploadImageResponse = z.infer<typeof productSchema.uploadImage.response>;
export async function POST(request: NextRequest) {
  const token = cookies().get("session")?.value || "";

  try {
    await verifyToken(token);

    const body = (await request.json()) as UploadImageBody;

    const { error } = validateBody({
      body,
      schema: productSchema.uploadImage.body,
    });
    if (error) return throwError(error, { status: 400 });

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME || "",
      Key: body.id,
      ContentLength: body.size,
      ContentType: body.content_type,
    });
    const signedUrl = await getSignedUrl(s3ClientConfig, command, {
      expiresIn: 3600,
    });
    s3ClientConfig.destroy();

    return handleApiData<UploadImageResponse>(
      {
        data: {
          signed_url: signedUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
