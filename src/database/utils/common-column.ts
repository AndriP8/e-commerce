import { CreateTableBuilder, RawBuilder, sql } from "kysely";

export const defaultTimestamp: RawBuilder<string> = sql`TO_CHAR(timezone('Asia/Jakarta', now()), 'YYYY-MM-DD HH24:MI:SS.MS')`;

export const PRIMARY_KEY_COLUMN = <T extends string, C extends string = never>(
  builder: CreateTableBuilder<T, C>,
) =>
  builder.addColumn("id", "uuid", (col) =>
    col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
  );

export const TIMESTAMPS_COLUMN = <T extends string, C extends string = never>(
  builder: CreateTableBuilder<T, C>,
) => {
  return builder
    .addColumn("created_at", "text", (col) =>
      col.defaultTo(defaultTimestamp).notNull(),
    )
    .addColumn("updated_at", "text");
};
export const SOFT_DELETE_COLUMN = <T extends string, C extends string = never>(
  builder: CreateTableBuilder<T, C>,
) => {
  return builder.addColumn("deleted_at", "text");
};
