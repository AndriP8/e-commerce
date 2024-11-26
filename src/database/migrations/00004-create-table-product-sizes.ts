import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import {
  PRIMARY_KEY_COLUMN,
  SOFT_DELETE_COLUMN,
  TIMESTAMPS_COLUMN,
} from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("sizes")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("size", "varchar(3)", (col) => col.notNull().unique())
    .$call(TIMESTAMPS_COLUMN)
    .execute();

  await db.schema
    .createTable("product_sizes")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("stock", "integer", (col) => col.notNull())
    .addColumn("size_id", "uuid", (col) =>
      col
        .notNull()
        .references("sizes.id")
        .onUpdate("cascade")
        .onDelete("cascade"),
    )
    .addColumn("product_id", "uuid", (col) =>
      col
        .notNull()
        .references("products.id")
        .onUpdate("cascade")
        .onDelete("cascade"),
    )
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("sizes").execute();
  await db.schema.dropTable("product_sizes").execute();
}
