import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { comparePassword } from "@/lib/helpers/password";
import { encrypt } from "@/lib/helpers/session";
import { validateBody } from "@/lib/helpers/validate-body";
import { publicLoginSchema } from "@/lib/schema/public/login.schema";

type PublicLoginResponse = z.infer<typeof publicLoginSchema.create.response>;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<
      typeof publicLoginSchema.create.body
    >;
    const { error } = validateBody({
      body,
      schema: publicLoginSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const { email, password } = body;

    const buyer = await db
      .selectFrom("buyers")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();
    if (!buyer) return throwError("User not found", { status: 404 });

    const isPasswordValid = await comparePassword(password, buyer.password);
    if (!isPasswordValid)
      return throwError("Invalid password", { status: 401 });

    const token = await encrypt({
      id: buyer.id,
      name: buyer.name,
      email: buyer.email,
    });

    return handleApiData<PublicLoginResponse>(
      {
        data: {
          token,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
