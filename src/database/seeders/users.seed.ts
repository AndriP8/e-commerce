import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import { hashPassword } from "../../lib/helpers/password";

export default async function userSeeder(db: Kysely<DB>) {
  return db
    .insertInto("users")
    .values({
      email: process.env.ADMIN_EMAIL || "",
      password: await hashPassword(process.env.ADMIN_PASSWORD || ""),
      name: process.env.ADMIN_NAME || "",
    })
    .executeTakeFirst();
}
