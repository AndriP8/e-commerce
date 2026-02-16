// Define types for form state
export type AddressDetail = {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: "shipping" | "billing";
  receiver_name?: string;
  receiver_phone?: string;
};

export type ShippingDetail = {
  shipping_method_id: string;
  estimated_delivery: string;
};

type PaymentDetail = {
  payment_method: string;
  payment_provider: string;
};

type CheckoutState = {
  step: number;
  addressDetail: AddressDetail;
  shippingDetail: ShippingDetail;
  paymentDetail: PaymentDetail;
  clientSecret: string | null;
  loading: boolean;
  error: string | null;
  useSameForBilling: boolean;
  billingAddress: AddressDetail;
};

type CheckoutAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_ADDRESS"; payload: Partial<AddressDetail> }
  | { type: "UPDATE_SHIPPING"; payload: Partial<ShippingDetail> }
  | { type: "UPDATE_PAYMENT"; payload: Partial<PaymentDetail> }
  | { type: "SET_CLIENT_SECRET"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "TOGGLE_SAME_BILLING" }
  | { type: "UPDATE_BILLING_ADDRESS"; payload: Partial<AddressDetail> };

export const initialState: CheckoutState = {
  step: 1,
  addressDetail: {
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    address_type: "shipping",
    receiver_name: "",
    receiver_phone: "",
  },
  shippingDetail: {
    shipping_method_id: "",
    estimated_delivery: "",
  },
  paymentDetail: {
    payment_method: "card",
    payment_provider: "stripe",
  },
  clientSecret: null,
  loading: false,
  error: null,
  useSameForBilling: true,
  billingAddress: {
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    address_type: "billing",
    receiver_name: "",
    receiver_phone: "",
  },
};

export function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction,
): CheckoutState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "UPDATE_ADDRESS":
      return {
        ...state,
        addressDetail: { ...state.addressDetail, ...action.payload },
      };
    case "UPDATE_SHIPPING":
      return {
        ...state,
        shippingDetail: { ...state.shippingDetail, ...action.payload },
      };
    case "UPDATE_PAYMENT":
      return {
        ...state,
        paymentDetail: { ...state.paymentDetail, ...action.payload },
      };
    case "SET_CLIENT_SECRET":
      return { ...state, clientSecret: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "TOGGLE_SAME_BILLING":
      return { ...state, useSameForBilling: !state.useSameForBilling };
    case "UPDATE_BILLING_ADDRESS":
      return {
        ...state,
        billingAddress: { ...state.billingAddress, ...action.payload },
      };
    default:
      return state;
  }
}
