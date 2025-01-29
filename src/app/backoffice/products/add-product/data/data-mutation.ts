import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

import { FileWithPreview } from "../../reducers/upload-reducer";

type UploadImageArgs = {
  onProgress: (id: string, progress: number) => void;
  onComplete: (id: string) => void;
  onError: (id: string, error: string) => void;
  file: FileWithPreview;
};
type UploadBody = z.infer<typeof productSchema.uploadImage.body>;
type DeleteImageArgs = {
  onComplete: (id: string) => void;
  onError: () => void;
  id: string;
};

export function useProductImageMutation() {
  const uploadImage = async ({
    file,
    onProgress,
    onComplete,
    onError,
  }: UploadImageArgs) => {
    if (!file.file) return;
    const uploadBody: UploadBody = {
      id: file.id,
      filename: file.file.name,
      size: file.file.size,
      content_type: file.file.type,
    };
    try {
      const response = await fetch("/api/products/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }

      const { data } = await response.json();

      // Update progress to 10% after getting signed URL
      onProgress(file.id, 10);

      // Step 2: Upload file to signed URL
      const uploadResponse = await fetch(data.signed_url, {
        method: "PUT",
        body: file.file,
        headers: {
          "Content-Type": file.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
      }

      // Simulate upload progress
      for (let i = 20; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        onProgress(file.id, i);
      }

      onComplete(file.id);
    } catch (error) {
      onError(
        file.id,
        error instanceof Error ? error.message : "Upload failed",
      );
    }
  };

  const deleteImage = async ({ onComplete, onError, id }: DeleteImageArgs) => {
    try {
      const response = await fetch(`/api/products/images/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the image");
      }

      onComplete(id);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error deleting uploaded image:", error);
      onError();
    }
  };
  return { uploadImage, deleteImage };
}

export type CreateProductBody = z.infer<typeof productSchema.create.body>;
export type CreateProductResponse = z.infer<
  typeof productSchema.create.response
>;
type CreateProductArgs = {
  body: CreateProductBody;
};
export async function createProduct(
  body: CreateProductArgs,
): Promise<CreateProductResponse> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to create product: ${response.statusText}`);
  }

  return response.json();
}
