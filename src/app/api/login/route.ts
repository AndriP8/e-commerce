import { createSecretKey } from "crypto";
import * as jose from "jose";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { comparePassword } from "@/lib/helpers/password";
import { validateBody } from "@/lib/helpers/validate-body";
import { loginSchema } from "@/lib/schema/login.schema";

type LoginResponse = z.infer<typeof loginSchema.create.response>;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<
      typeof loginSchema.create.body
    >;
    const { error } = validateBody({
      body,
      schema: loginSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const { email, password } = body;

    const user = await db
      .selectFrom("users")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();
    if (!user) return throwError("User not found", { status: 404 });

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return throwError("Invalid password", { status: 401 });

    const key = createSecretKey(process.env.SECRET_KEY || "", "utf-8");
    const token = await new jose.SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "jwt" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(key);

    return handleApiData<LoginResponse>({ data: { token } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
