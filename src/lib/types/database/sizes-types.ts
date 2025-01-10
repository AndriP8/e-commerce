import { Insertable, Selectable, Updateable } from "kysely";
import { Sizes as SizesTable } from "kysely-codegen";

export type Size = Selectable<SizesTable>;
export type CreateSize = Insertable<SizesTable>;
export type UpdateSize = Updateable<SizesTable>;
