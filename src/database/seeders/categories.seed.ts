import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

import { categories } from "@/lib/enums/categories";

export default async function categoriesSeeder(
  db: Kysely<DB>,
): Promise<unknown> {
  const categoryPromises = categories.map((category) =>
    db
      .insertInto("categories")
      .values({
        name: category,
      })
      .executeTakeFirst(),
  );

  return Promise.all(categoryPromises);
}
