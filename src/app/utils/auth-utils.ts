import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { pool } from "../db/client";
import { UnauthorizedError } from "./api-error-handler";
import { JWT_EXPIRES_IN, JWT_SECRET } from "./jwt-secret";

// Interface for user data
export interface UserData {
  id: string;
  email: string;
  user_type: string;
}

// Interface for JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(user: UserData): Promise<string> {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    userType: user.user_type,
  };

  const jwt = new SignJWT({ ...payload })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setProtectedHeader({ alg: "HS256" });
  const token = await jwt.sign(new TextEncoder().encode(JWT_SECRET));
  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  return await jwtVerify<JwtPayload>(
    token,
    new TextEncoder().encode(JWT_SECRET),
    {
      algorithms: ["HS256"],
    },
  )
    .then(({ payload }) => {
      return payload;
    })
    .catch((err) => {
      if (err) {
        throw new UnauthorizedError("Invalid token");
      } else {
        throw new UnauthorizedError("Invalid token");
      }
    });
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day in seconds
    sameSite: "strict",
  });
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.delete("token");
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token: string) {
  try {
    const decoded = await verifyToken(token);
    const client = await pool.connect();

    try {
      const result = await client.query(
        "SELECT id, email, first_name, last_name, user_type FROM users WHERE id = $1",
        [decoded.userId],
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedError("User not found");
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  } catch {
    throw new UnauthorizedError("Invalid authentication");
  }
}
