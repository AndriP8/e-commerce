import { Kysely, sql } from "kysely";
import { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`set timezone to 'Asia/Jakarta'`.execute(db); // Set Postgres timezone
  await sql`create extension if not exists "uuid-ossp"`.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`reset timezone`.execute(db);
  await sql`drop extension if exists "uuid-ossp"`.execute(db);
}
