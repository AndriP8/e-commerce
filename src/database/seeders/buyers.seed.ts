import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import { hashPassword } from "../../lib/helpers/password";

export default async function userSeeder(db: Kysely<DB>) {
  return db
    .insertInto("buyers")
    .values({
      email: process.env.BUYER_EMAIL || "",
      password: await hashPassword(process.env.BUYER_PASSWORD || ""),
      name: process.env.BUYER_NAME || "",
    })
    .execute();
}
