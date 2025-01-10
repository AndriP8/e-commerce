import { Insertable, Selectable, Updateable } from "kysely";
import { Buyers as BuyersTable } from "kysely-codegen";

export type Buyer = Selectable<BuyersTable>;
export type CreateBuyer = Insertable<BuyersTable>;
export type UpdateBuyer = Updateable<BuyersTable>;
