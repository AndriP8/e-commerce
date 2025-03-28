import { Kysely } from "kysely";

import { DB } from "@/generated/db";

import {
  PRIMARY_KEY_COLUMN,
  SOFT_DELETE_COLUMN,
  TIMESTAMPS_COLUMN,
} from "../utils/common-column";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("buyers")
    .$call(PRIMARY_KEY_COLUMN)
    .addColumn("name", "varchar", (col) => col.notNull().unique())
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("password", "varchar", (col) => col.notNull())
    .addColumn("address", "jsonb", (col) => col.unique())
    .$call(TIMESTAMPS_COLUMN)
    .$call(SOFT_DELETE_COLUMN)
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("buyers").execute();
}
