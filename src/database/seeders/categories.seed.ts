import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

const categories = [
  {
    name: "Shirts",
  },
  {
    name: "T-Shirts",
  },
  {
    name: "Sweaters",
  },
  {
    name: "Jackets",
  },
];

export default async function categoriesSeeder(
  db: Kysely<DB>,
): Promise<unknown> {
  const categoryPromises = categories.map((category) =>
    db
      .insertInto("categories")
      .values({
        name: category.name,
      })
      .executeTakeFirst(),
  );

  return Promise.all(categoryPromises);
}
