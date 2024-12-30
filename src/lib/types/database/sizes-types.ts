import { Sizes as GeneratedSizes } from "kysely-codegen";

import { ManipulateGeneratedTypes } from "../manipulate-generated-types";

export type Sizes = ManipulateGeneratedTypes<
  GeneratedSizes,
  [
    ["id", GeneratedSizes["id"]["__select__"]],
    ["created_at", GeneratedSizes["created_at"]["__select__"]],
  ]
>;
