import { Kysely, sql } from "kysely";
import { DB } from "kysely-codegen";

import {
  PRIMARY_KEY_COLUMN,
  SOFT_DELETE_COLUMN,
  TIMESTAMPS_COLUMN,
} from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("categories")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull().unique())
    .addColumn("code", "varchar", (col) =>
      col
        .notNull()
        .defaultTo(
          sql`('000' || to_char(nextval(pg_get_serial_sequence('categories', 'code')), 'FM000'))`,
        )
        .unique(),
    )
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();

  await db.schema
    .createTable("products")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull().unique())
    .addColumn("price", "integer", (col) => col.notNull())
    .addColumn("description", "varchar", (col) => col.notNull())
    .addColumn("images", "jsonb", (col) => col.notNull())
    .addColumn("discount", "integer")
    .addColumn("sku", "varchar", (col) => col.notNull().unique())
    .addColumn("category_id", "uuid", (col) =>
      col.notNull().references("categories.id"),
    )
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("products").execute();
  await db.schema.dropTable("categories").execute();
}
