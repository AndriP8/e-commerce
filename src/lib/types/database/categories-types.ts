import { Insertable, Selectable, Updateable } from "kysely";

import { Categories as CategoriesTable } from "@/generated/db";

export type Category = Selectable<CategoriesTable>;
export type CreateCategory = Insertable<CategoriesTable>;
export type UpdateCategory = Updateable<CategoriesTable>;
