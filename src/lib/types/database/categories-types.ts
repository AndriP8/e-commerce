import { Insertable, Selectable, Updateable } from "kysely";
import { Categories as CategoriesTable } from "kysely-codegen";

export type Category = Selectable<CategoriesTable>;
export type CreateCategory = Insertable<CategoriesTable>;
export type UpdateCategory = Updateable<CategoriesTable>;
