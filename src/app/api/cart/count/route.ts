import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import {
  handleApiError,
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const decoded = await verifyToken(token);
    const user_id = decoded.userId;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT COUNT(ci.id)::int AS count
         FROM shopping_carts sc
         LEFT JOIN cart_items ci ON ci.cart_id = sc.id
         WHERE sc.user_id = $1`,
        [user_id],
      );

      const count = result.rows[0]?.count ?? 0;
      return NextResponse.json({ data: { count } });
    } finally {
      client.release();
    }
  } catch (error) {
    const apiError = handleApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
