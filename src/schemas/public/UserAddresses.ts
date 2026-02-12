import type { UsersId } from './Users';
import type { default as AddressTypeEnum } from './AddressTypeEnum';

export type UserAddressesId = string & { __brand: 'public.user_addresses' };

export default interface UserAddresses {
  id: UserAddressesId;

  user_id: UsersId;

  address_line1: string;

  address_line2: string | null;

  city: string;

  state: string;

  postal_code: string;

  country: string;

  is_default: boolean | null;

  address_type: AddressTypeEnum;

  created_at: Date;
}

export interface UserAddressesInitializer {
  id: UserAddressesId;

  user_id: UsersId;

  address_line1: string;

  address_line2?: string | null;

  city: string;

  state: string;

  postal_code: string;

  country: string;

  is_default?: boolean | null;

  address_type: AddressTypeEnum;

  created_at?: Date;
}

export interface UserAddressesMutator {
  id?: UserAddressesId;

  user_id?: UsersId;

  address_line1?: string;

  address_line2?: string | null;

  city?: string;

  state?: string;

  postal_code?: string;

  country?: string;

  is_default?: boolean | null;

  address_type?: AddressTypeEnum;

  created_at?: Date;
}
