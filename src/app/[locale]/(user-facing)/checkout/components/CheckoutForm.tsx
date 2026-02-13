"use client";

import { useState, useEffect, useMemo, useReducer } from "react";
import dynamic from "next/dynamic";
import { GetCartResponse } from "@/app/types/cart";
import { toast } from "sonner";
import { initialState, checkoutReducer } from "./checkoutReducer";
import { useCheckoutCost } from "@/app/contexts/CheckoutCostContext";
import { CurrencyConversion } from "@/app/types/currency";
import { formatPrice } from "@/app/utils/format-price-currency";
import { useApi } from "@/app/utils/api-client";

// Dynamically import Stripe components only when needed
const StripePaymentSection = dynamic(() => import("./StripePaymentSection"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

const getConversion = async ({
  amount,
  from,
  to,
}: {
  amount: number;
  from: string;
  to: string;
}): Promise<CurrencyConversion> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/currency/convert?amount=${amount}&from=${from}&to=${to}`,
  );
  const data = await response.json();
  return data;
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  base_costs: number;
  currency_id: string;
  min_days: number;
  max_days: number;
};

import { useTranslations } from "next-intl";

interface CheckoutFormProps {
  cart: GetCartResponse;
}

function CheckoutForm({ cart }: CheckoutFormProps) {
  const t = useTranslations("Checkout");
  const [shippingCostConversion, setShippingCostConversion] = useState(0);
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { updateShippingCost, shippingCost, tax } = useCheckoutCost();
  const api = useApi();

  const shippingMethods: ShippingMethod[] = useMemo(
    () => [
      {
        id: "1", // Database ID for Standard Shipping
        name: t("shippingMethods.standard.name"),
        description: t("shippingMethods.standard.description"),
        base_costs: 0,
        currency_id: "USD",
        min_days: 3,
        max_days: 5,
      },
      {
        id: "2", // Database ID for Express Shipping
        name: t("shippingMethods.express.name"),
        description: t("shippingMethods.express.description"),
        base_costs: 10, // Updated to match database value
        currency_id: "USD",
        min_days: 1,
        max_days: 2,
      },
    ],
    [t],
  );

  const nextStep = () => {
    if (state.step === 1) {
      // Validate shipping address
      const { address_line1, city, state: stateValue, postal_code, country } = state.addressDetail;
      if (!address_line1 || !city || !stateValue || !postal_code || !country) {
        toast.error(t("errors.fillAllFields"));
        return;
      }
    } else if (state.step === 2) {
      // Validate shipping method
      if (!state.shippingDetail.shipping_method_id) {
        toast.error(t("errors.selectShippingMethod"));
        return;
      }

      // If not using same address for billing, validate billing address
      if (!state.useSameForBilling) {
        const {
          address_line1,
          city,
          state: stateValue,
          postal_code,
          country,
        } = state.billingAddress;
        if (!address_line1 || !city || !stateValue || !postal_code || !country) {
          toast.error(t("errors.fillBillingFields"));
          return;
        }
      }

      // Create payment intent and get client secret
      createPaymentIntent();
    }

    dispatch({ type: "SET_STEP", payload: state.step + 1 });
  };

  const prevStep = () => {
    dispatch({ type: "SET_STEP", payload: state.step - 1 });
  };

  const createPaymentIntent = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    const subTotal = cart.data.items.reduce((sum, item) => sum + item.total_price, 0);
    // Include tax in the total amount
    const total = subTotal + shippingCost + tax;

    try {
      const response = await api.post("/api/checkout/payment-intent", {
        cart_id: cart.data.cart_id,
        amount: total,
        currency: cart.currency.code,
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      dispatch({ type: "SET_CLIENT_SECRET", payload: data.clientSecret });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Error creating payment: " + (error as Error).message,
      });
      toast.error("Error creating payment");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (state.step !== 3) {
      nextStep();
      return;
    }
  };

  useEffect(() => {
    getConversion({
      amount: shippingMethods[shippingMethods.length - 1].base_costs,
      from: "USD",
      to: cart.currency.code,
    }).then((data) => {
      setShippingCostConversion(data.convertedAmount);
    });
  }, [cart.currency.code, shippingMethods]);

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div className="ml-2 font-medium">{t("steps.shipping")}</div>
          </div>
          <div className="h-1 w-16 bg-gray-200 mx-2">
            <div className={`h-full ${state.step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div className="ml-2 font-medium">{t("steps.delivery")}</div>
          </div>
          <div className="h-1 w-16 bg-gray-200 mx-2">
            <div className={`h-full ${state.step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <div className="ml-2 font-medium">{t("steps.payment")}</div>
          </div>
        </div>
      </div>

      {state.step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">{t("address.shipping")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="receiver_name"
                id="receiver_name_label"
              >
                {t("address.receiverName")} *
              </label>
              <input
                type="text"
                id="receiver_name"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.receiver_name}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { receiver_name: e.target.value },
                  })
                }
                autoComplete="shipping name"
                autoCorrect="off"
                spellCheck="false"
                aria-required="true"
                aria-labelledby="receiver_name_label"
                aria-invalid={
                  !state.addressDetail.receiver_name && state.step > 1 ? "true" : "false"
                }
                required
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="receiver_phone"
                id="receiver_phone_label"
              >
                {t("address.receiverPhone")} *
              </label>
              <input
                type="tel"
                id="receiver_phone"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.receiver_phone}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { receiver_phone: e.target.value },
                  })
                }
                autoComplete="shipping tel"
                autoCorrect="off"
                spellCheck="false"
                inputMode="tel"
                aria-required="true"
                aria-labelledby="receiver_phone_label"
                aria-invalid={
                  !state.addressDetail.receiver_phone && state.step > 1 ? "true" : "false"
                }
                required
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="address_line1"
                id="address_line1_label"
              >
                {t("address.addressLine1")} *
              </label>
              <input
                type="text"
                id="address_line1"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.address_line1}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { address_line1: e.target.value },
                  })
                }
                autoComplete="shipping address-line1"
                autoCorrect="off"
                spellCheck="false"
                aria-required="true"
                aria-labelledby="address_line1_label"
                aria-invalid={
                  !state.addressDetail.address_line1 && state.step > 1 ? "true" : "false"
                }
                required
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="address_line2"
                id="address_line2_label"
              >
                {t("address.addressLine2")}
              </label>
              <input
                type="text"
                id="address_line2"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.address_line2}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { address_line2: e.target.value },
                  })
                }
                autoComplete="shipping address-line2"
                autoCorrect="off"
                spellCheck="false"
                aria-labelledby="address_line2_label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city" id="city_label">
                {t("address.city")} *
              </label>
              <input
                type="text"
                id="city"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.city}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { city: e.target.value },
                  })
                }
                autoComplete="shipping address-level2"
                autoCorrect="off"
                spellCheck="false"
                aria-required="true"
                aria-labelledby="city_label"
                aria-invalid={!state.addressDetail.city && state.step > 1 ? "true" : "false"}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="state" id="state_label">
                {t("address.state")} *
              </label>
              <input
                type="text"
                id="state"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.state}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { state: e.target.value },
                  })
                }
                autoComplete="shipping address-level1"
                aria-required="true"
                aria-labelledby="state_label"
                aria-invalid={!state.addressDetail.state && state.step > 1 ? "true" : "false"}
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="postal_code"
                id="postal_code_label"
              >
                {t("address.postalCode")} *
              </label>
              <input
                type="text"
                id="postal_code"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.postal_code}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { postal_code: e.target.value },
                  })
                }
                autoComplete="shipping postal-code"
                autoCorrect="off"
                spellCheck="false"
                inputMode="numeric"
                aria-required="true"
                aria-labelledby="postal_code_label"
                aria-invalid={!state.addressDetail.postal_code && state.step > 1 ? "true" : "false"}
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="country"
                id="country_label"
              >
                {t("address.country")} *
              </label>
              <input
                type="text"
                id="country"
                className="w-full border rounded-md px-3 py-2"
                value={state.addressDetail.country}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_ADDRESS",
                    payload: { country: e.target.value },
                  })
                }
                autoComplete="shipping country"
                aria-required="true"
                aria-labelledby="country_label"
                aria-invalid={!state.addressDetail.country && state.step > 1 ? "true" : "false"}
                required
              />
            </div>
          </div>
        </div>
      )}

      {state.step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">{t("shippingMethods.title")}</h2>
          <fieldset className="space-y-4">
            <legend className="sr-only">{t("shippingMethods.options")}</legend>
            {shippingMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer ${
                  state.shippingDetail.shipping_method_id === method.id
                    ? "border-blue-600 bg-blue-50"
                    : ""
                }`}
                onClick={() => {
                  const today = new Date();
                  const deliveryDate = new Date(today);
                  deliveryDate.setDate(today.getDate() + method.max_days);
                  // Update shipping method in local state
                  dispatch({
                    type: "UPDATE_SHIPPING",
                    payload: {
                      shipping_method_id: method.id,
                      estimated_delivery: deliveryDate.toISOString(),
                    },
                  });

                  // Update shipping cost in context
                  updateShippingCost(
                    method.base_costs === 0 ? method.base_costs : shippingCostConversion,
                  );
                }}
                role="radio"
                aria-checked={state.shippingDetail.shipping_method_id === method.id}
                aria-labelledby={`shipping_method_${method.id}_name shipping_method_${method.id}_price`}
                aria-describedby={`shipping_method_${method.id}_description`}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const today = new Date();
                    const deliveryDate = new Date(today);
                    deliveryDate.setDate(today.getDate() + method.max_days);

                    dispatch({
                      type: "UPDATE_SHIPPING",
                      payload: {
                        shipping_method_id: method.id,
                        estimated_delivery: deliveryDate.toISOString(),
                      },
                    });

                    updateShippingCost(
                      method.base_costs === 0 ? method.base_costs : shippingCostConversion,
                    );
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium" id={`shipping_method_${method.id}_name`}>
                      {method.name}
                    </h3>
                    <p
                      className="text-sm text-gray-600"
                      id={`shipping_method_${method.id}_description`}
                    >
                      {method.description}
                    </p>
                  </div>
                  <div className="font-medium" id={`shipping_method_${method.id}_price`}>
                    {method.base_costs === 0
                      ? t("summary.free")
                      : formatPrice(shippingCostConversion, cart.currency)}
                  </div>
                </div>
              </div>
            ))}
          </fieldset>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">{t("address.billing")}</h2>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="same_billing_address"
                  className="mr-2"
                  checked={state.useSameForBilling}
                  onChange={() => dispatch({ type: "TOGGLE_SAME_BILLING" })}
                  aria-labelledby="same_billing_address_label"
                />
                <label
                  htmlFor="same_billing_address"
                  id="same_billing_address_label"
                  className="cursor-pointer"
                >
                  {t("address.sameAsBilling")}
                </label>
              </div>
            </div>

            {!state.useSameForBilling && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="billing_receiver_name">
                    {t("address.receiverName")} *
                  </label>
                  <input
                    type="text"
                    id="billing_receiver_name"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.receiver_name}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { receiver_name: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_receiver_phone"
                  >
                    {t("address.receiverPhone")} *
                  </label>
                  <input
                    type="tel"
                    id="billing_receiver_phone"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.receiver_phone}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { receiver_phone: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="billing_address_line1">
                    {t("address.addressLine1")} *
                  </label>
                  <input
                    type="text"
                    id="billing_address_line1"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.address_line1}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { address_line1: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="billing_address_line2">
                    {t("address.addressLine2")}
                  </label>
                  <input
                    type="text"
                    id="billing_address_line2"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.address_line2}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { address_line2: e.target.value },
                      })
                    }
                    autoComplete="billing address-line2"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-labelledby="billing_address_line2_label"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_city"
                    id="billing_city_label"
                  >
                    {t("address.city")} *
                  </label>
                  <input
                    type="text"
                    id="billing_city"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.city}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { city: e.target.value },
                      })
                    }
                    autoComplete="billing address-level2"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-required="true"
                    aria-labelledby="billing_city_label"
                    aria-invalid={
                      !state.billingAddress.city && !state.useSameForBilling && state.step > 2
                        ? "true"
                        : "false"
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_state"
                    id="billing_state_label"
                  >
                    {t("address.state")} *
                  </label>
                  <input
                    type="text"
                    id="billing_state"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.state}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { state: e.target.value },
                      })
                    }
                    autoComplete="billing address-level1"
                    aria-required="true"
                    aria-labelledby="billing_state_label"
                    aria-invalid={
                      !state.billingAddress.state && !state.useSameForBilling && state.step > 2
                        ? "true"
                        : "false"
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_postal_code"
                    id="billing_postal_code_label"
                  >
                    {t("address.postalCode")} *
                  </label>
                  <input
                    type="text"
                    id="billing_postal_code"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.postal_code}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { postal_code: e.target.value },
                      })
                    }
                    autoComplete="billing postal-code"
                    autoCorrect="off"
                    spellCheck="false"
                    inputMode="numeric"
                    aria-required="true"
                    aria-labelledby="billing_postal_code_label"
                    aria-invalid={
                      !state.billingAddress.postal_code &&
                      !state.useSameForBilling &&
                      state.step > 2
                        ? "true"
                        : "false"
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_country"
                    id="billing_country_label"
                  >
                    {t("address.country")} *
                  </label>
                  <input
                    type="text"
                    id="billing_country"
                    className="w-full border rounded-md px-3 py-2"
                    value={state.billingAddress.country}
                    onChange={(e) =>
                      dispatch({
                        type: "UPDATE_BILLING_ADDRESS",
                        payload: { country: e.target.value },
                      })
                    }
                    autoComplete="billing country"
                    aria-required="true"
                    aria-labelledby="billing_country_label"
                    aria-invalid={
                      !state.billingAddress.country && !state.useSameForBilling && state.step > 2
                        ? "true"
                        : "false"
                    }
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {state.step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">{t("steps.payment")}</h2>
          {state.clientSecret ? (
            <StripePaymentSection
              clientSecret={state.clientSecret}
              cart={cart}
              addressDetail={state.useSameForBilling ? state.addressDetail : state.billingAddress}
              shippingDetail={state.shippingDetail}
              shippingAddress={state.addressDetail}
            />
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>{t("actions.preparingPayment")}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {state.step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t("actions.back")}
          </button>
        )}
        {state.step < 3 && (
          <button
            type="submit"
            onClick={handleSubmit}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t("actions.continue")}
          </button>
        )}
      </div>
    </div>
  );
}

export default CheckoutForm;
