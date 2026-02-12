import type { default as UserEnum } from "./UserEnum";

export type UsersId = string & { __brand: "public.users" };

export default interface Users {
  id: UsersId;

  email: string;

  password_hash: string;

  first_name: string | null;

  last_name: string | null;

  phone: string | null;

  created_at: Date | null;

  updated_at: Date | null;

  is_active: boolean | null;

  user_type: UserEnum;
}

export interface UsersInitializer {
  
  id: UsersId;

  email: string;

  password_hash: string;

  first_name?: string | null;

  last_name?: string | null;

  phone?: string | null;

  created_at?: Date | null;

  updated_at?: Date | null;

  is_active?: boolean | null;

  user_type: UserEnum;
}

export interface UsersMutator {
  id?: UsersId;

  email?: string;

  password_hash?: string;

  first_name?: string | null;

  last_name?: string | null;

  phone?: string | null;

  created_at?: Date | null;

  updated_at?: Date | null;

  is_active?: boolean | null;

  user_type?: UserEnum;
}
