import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

const sizes = ["S", "M", "L", "XL"];

export default async function sizesSeeder(db: Kysely<DB>): Promise<unknown> {
  const categoryPromises = sizes.map((size) =>
    db
      .insertInto("sizes")
      .values({
        size: size,
      })
      .executeTakeFirst(),
  );

  return Promise.all(categoryPromises);
}
