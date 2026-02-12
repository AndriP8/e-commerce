export type ShippingMethodsId = string & { __brand: 'public.shipping_methods' };

export default interface ShippingMethods {
  id: ShippingMethodsId;

  name: string;

  description: string | null;

  base_costs: string;

  estimated_days_min: number;

  estimated_days_max: number;

  is_active: boolean | null;
}

export interface ShippingMethodsInitializer {
  id: ShippingMethodsId;

  name: string;

  description?: string | null;

  base_costs: string;

  estimated_days_min: number;

  estimated_days_max: number;

  is_active?: boolean | null;
}

export interface ShippingMethodsMutator {
  id?: ShippingMethodsId;

  name?: string;

  description?: string | null;

  base_costs?: string;

  estimated_days_min?: number;

  estimated_days_max?: number;

  is_active?: boolean | null;
}
