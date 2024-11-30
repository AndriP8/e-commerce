import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import {
  PRIMARY_KEY_COLUMN,
  SOFT_DELETE_COLUMN,
  TIMESTAMPS_COLUMN,
} from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("users")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull().unique())
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("password", "varchar", (col) => col.notNull())
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
