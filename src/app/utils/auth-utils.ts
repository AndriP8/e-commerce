import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { UnauthorizedError } from "./api-error-handler";
import { pool } from "../db/client";

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h"; // Token expiration time

// Interface for user data
export interface UserData {
  id: number;
  email: string;
  user_type: string;
}

// Interface for JWT payload
export interface JwtPayload {
  userId: number;
  email: string;
  userType: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: UserData): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    userType: user.user_type,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): Promise<JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(new UnauthorizedError("Invalid token"));
      } else {
        resolve(decoded as JwtPayload);
      }
    });
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
  } catch (error) {
    throw new UnauthorizedError("Invalid authentication");
  }
}
