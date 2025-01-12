import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import { PRIMARY_KEY_COLUMN, TIMESTAMPS_COLUMN } from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("carts")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("buyer_id", "uuid", (col) =>
      col.notNull().references("buyers.id"),
    )
    .addColumn("product_id", "uuid", (col) =>
      col.notNull().references("products.id"),
    )
    .addColumn("quantity", "integer", (col) => col.notNull())
    .$call(TIMESTAMPS_COLUMN)
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("carts").execute();
}
