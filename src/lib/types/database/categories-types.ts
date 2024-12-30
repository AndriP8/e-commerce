import { Categories as GeneratedCategories } from "kysely-codegen";

import { ManipulateGeneratedTypes } from "../manipulate-generated-types";

export type Categories = ManipulateGeneratedTypes<
  GeneratedCategories,
  [
    ["id", GeneratedCategories["id"]["__select__"]],
    ["code", GeneratedCategories["code"]["__select__"]],
    ["created_at", GeneratedCategories["created_at"]["__select__"]],
  ]
>;
