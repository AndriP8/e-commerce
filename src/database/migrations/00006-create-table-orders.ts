import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import {
  PRIMARY_KEY_COLUMN,
  SOFT_DELETE_COLUMN,
  TIMESTAMPS_COLUMN,
} from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("orders")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("address", "varchar", (col) => col.notNull().unique())
    .addColumn("status", "varchar", (col) => col.notNull())
    .addColumn("total_amount", "integer", (col) => col.notNull())
    .addColumn("buyer_id", "uuid", (col) =>
      col.notNull().references("buyers.id"),
    )
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();

  await db.schema
    .createTable("order_items")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull())
    .addColumn("size", "varchar", (col) => col.notNull())
    .addColumn("price", "integer", (col) => col.notNull())
    .addColumn("description", "varchar")
    .addColumn("discount", "integer")
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("order_id", "uuid", (col) =>
      col.notNull().references("orders.id"),
    )
    .addColumn("product_id", "uuid", (col) =>
      col.notNull().references("products.id"),
    )
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("buyers").execute();
}
