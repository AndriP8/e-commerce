import { Users as GeneratedUsers } from "kysely-codegen";

import { ManipulateGeneratedTypes } from "../manipulate-generated-types";

export type Users = ManipulateGeneratedTypes<
  GeneratedUsers,
  [
    ["id", GeneratedUsers["id"]["__select__"]],
    ["created_at", GeneratedUsers["created_at"]["__select__"]],
  ]
>;
