import { Kysely, sql } from "kysely";
import { DB } from "kysely-codegen";

import {
  PRIMARY_KEY_COLUMN,
  SOFT_DELETE_COLUMN,
  TIMESTAMPS_COLUMN,
} from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
      CREATE SEQUENCE categories_code_seq
      START WITH 1
      INCREMENT BY 1
      MINVALUE 1
      MAXVALUE 100
      NO CYCLE`.execute(db);

  await db.schema
    .createTable("categories")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull().unique())
    .addColumn("code", "varchar", (col) =>
      col
        .defaultTo(sql`to_char(nextval('categories_code_seq'), 'FM000')`)
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
  await sql`DROP SEQUENCE IF EXISTS categories_code_seq;`.execute(db);
}
