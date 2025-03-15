import { Insertable, Selectable, Updateable } from "kysely";

import { Users as UsersTable } from "@/generated/db";

export type User = Selectable<UsersTable>;
export type CreateUser = Insertable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;
