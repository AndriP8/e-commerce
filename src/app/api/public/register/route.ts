import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { hashPassword } from "@/lib/helpers/password";
import { validateBody } from "@/lib/helpers/validate-body";
import { publicRegisterSchema } from "@/lib/schema/public/register.schema";

type RegisterResponse = z.infer<typeof publicRegisterSchema.create.response>;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<
      typeof publicRegisterSchema.create.body
    >;
    const { error } = validateBody({
      body,
      schema: publicRegisterSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const buyer = await db
      .selectFrom("buyers")
      .where("email", "=", body.email)
      .selectAll()
      .executeTakeFirst();
    if (buyer) return throwError("User already exists", { status: 400 });

    await db
      .insertInto("buyers")
      .values({
        ...body,
        password: await hashPassword(body.password),
      })
      .execute();

    return handleApiData<RegisterResponse>({ data: "OK" }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
