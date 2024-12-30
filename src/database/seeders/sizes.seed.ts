import { Kysely } from "kysely";
import { DB } from "kysely-codegen";

export const sizes = [
  { size: "S", order: 1 },
  { size: "M", order: 2 },
  { size: "L", order: 3 },
  { size: "XL", order: 4 },
  { size: "XXL", order: 5 },
] as const;

export default async function sizesSeeder(db: Kysely<DB>): Promise<unknown> {
  const categoryPromises = sizes.map((size) =>
    db
      .insertInto("sizes")
      .values({
        size: size.size,
        order: size.order,
      })
      .executeTakeFirst(),
  );

  return Promise.all(categoryPromises);
}
