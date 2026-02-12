import type { SellersId } from './Sellers';
import type { default as AddressTypeEnum } from './AddressTypeEnum';

export type SellerAddressesId = string & { __brand: 'public.seller_addresses' };

export default interface SellerAddresses {
  id: SellerAddressesId;

  seller_id: SellersId;

  address_line1: string;

  address_line2: string | null;

  city: string;

  state: string;

  postal_code: string;

  country: string;

  address_type: AddressTypeEnum;
}

export interface SellerAddressesInitializer {
  id: SellerAddressesId;

  seller_id: SellersId;

  address_line1: string;

  address_line2?: string | null;

  city: string;

  state: string;

  postal_code: string;

  country: string;

  address_type: AddressTypeEnum;
}

export interface SellerAddressesMutator {
  id?: SellerAddressesId;

  seller_id?: SellersId;

  address_line1?: string;

  address_line2?: string | null;

  city?: string;

  state?: string;

  postal_code?: string;

  country?: string;

  address_type?: AddressTypeEnum;
}
