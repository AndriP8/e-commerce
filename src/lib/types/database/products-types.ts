import { Products as GeneratedProducts } from "kysely-codegen";

import { ManipulateGeneratedTypes } from "../manipulate-generated-types";

export type Products = ManipulateGeneratedTypes<
  GeneratedProducts,
  [
    ["id", GeneratedProducts["id"]["__select__"]],
    ["created_at", GeneratedProducts["created_at"]["__select__"]],
  ]
>;
