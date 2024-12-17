import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { comparePassword } from "@/lib/helpers/password";
import { encrypt } from "@/lib/helpers/session";
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

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day
    const token = await encrypt({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const cookieStore = cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    return handleApiData<LoginResponse>({ data: "OK" }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
