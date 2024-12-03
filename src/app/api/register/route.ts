import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { hashPassword } from "@/lib/helpers/password";
import { validateBody } from "@/lib/helpers/validate-body";
import { registerSchema } from "@/lib/schema/register.schema";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<
      typeof registerSchema.create.body
    >;
    const { error } = validateBody({
      body,
      schema: registerSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const { email, name, password } = body;

    const user = await db
      .insertInto("users")
      .values({ email, name, password: await hashPassword(password) })
      .returning([
        "id",
        "name",
        "email",
        "created_at",
        "deleted_at",
        "updated_at",
      ])
      .executeTakeFirst();
    return handleApiData(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
