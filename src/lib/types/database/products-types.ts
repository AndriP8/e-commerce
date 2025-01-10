import { Insertable, Selectable, Updateable } from "kysely";
import { Products as ProductsTable } from "kysely-codegen";

export type Product = Selectable<ProductsTable>;
export type CreateProduct = Insertable<ProductsTable>;
export type UpdateProduct = Updateable<ProductsTable>;
