import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

const categories = [
  {
    name: "Shirts",
    code: "001",
  },
  {
    name: "T-Shirts",
    code: "002",
  },
  {
    name: "Sweaters",
    code: "003",
  },
  {
    name: "Jackets",
    code: "004",
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
        code: category.code,
      })
      .executeTakeFirst(),
  );

  return Promise.all(categoryPromises);
}
