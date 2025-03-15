import { Kysely, sql } from "kysely";

import { DB } from "@/generated/db";
import { orderStatus } from "@/lib/enums/order-status";

import { PRIMARY_KEY_COLUMN, TIMESTAMPS_COLUMN } from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createType("status")
    .asEnum([...orderStatus])
    .execute();

  await db.schema
    .createTable("orders")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("address", "varchar", (col) => col.notNull())
    .addColumn("status", sql`status`, (col) =>
      col.notNull().defaultTo("pending"),
    )
    .addColumn("total_amount", "integer", (col) => col.notNull())
    .addColumn("description", "varchar")
    .addColumn("receipt_number", "varchar")
    .addColumn("buyer_id", "uuid", (col) =>
      col.notNull().references("buyers.id"),
    )
    .$call(TIMESTAMPS_COLUMN)
    .execute();

  await db.schema
    .createTable("order_items")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("price", "integer", (col) => col.notNull())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("images", "jsonb", (col) => col.notNull())
    .addColumn("discount", "integer")
    .addColumn("sku", "varchar", (col) => col.notNull())
    .addColumn("category_id", "uuid", (col) =>
      col.notNull().references("categories.id"),
    )
    .addColumn("size_id", "uuid", (col) => col.notNull().references("sizes.id"))
    .addColumn("product_id", "uuid", (col) =>
      col.notNull().references("products.id"),
    )
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("order_id", "uuid", (col) =>
      col.notNull().references("orders.id").onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("order_items").execute();
  await db.schema.dropTable("orders").execute();
  await db.schema.dropType("status").execute();
}
