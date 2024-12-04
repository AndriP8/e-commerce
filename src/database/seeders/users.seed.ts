import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import { hashPassword } from "../../lib/helpers/password";

export const userSeeder = async (db: Kysely<DB>) => {
  return db
    .insertInto("users")
    .values({
      email: "admin@example.com",
      password: await hashPassword("admin123,"),
      name: "admin",
    })
    .executeTakeFirst();
};
