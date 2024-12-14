import { createSecretKey } from "crypto";
import * as jose from "jose";

import { throwError } from "./error-response";

export async function verifyToken(token: string) {
  try {
    const jwtToken = token.split("Bearer ")[1];
    const key = createSecretKey(process.env.SECRET_KEY || "", "utf-8");

    const resultJwtVerify = await jose.jwtVerify(jwtToken, key, {
      algorithms: ["HS256"],
      typ: "jwt",
    });
    return resultJwtVerify;
  } catch (error) {
    if (error instanceof Error) {
      throw throwError("Invalid token", { status: 401 });
    }
  }
}
