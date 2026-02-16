import { jwtVerify } from "jose";
import { JWT_SECRET } from "./jwt-secret";

export interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

export async function verifyTokenEdge(
  token: string,
): Promise<JwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify<JwtPayload>(token, secret);

    return {
      userId: payload.userId,
      email: payload.email,
      userType: payload.userType,
    };
  } catch {
    return null;
  }
}
