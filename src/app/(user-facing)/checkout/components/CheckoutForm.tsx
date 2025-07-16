"use client";

import { useReducer } from "react";
import { GetCartResponse } from "@/app/types/cart";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { initialState, checkoutReducer } from "./checkourReducer";
import PaymentForm from "./PaymentForm";
import { getStripe } from "@/app/utils/stripe";
import { useCheckoutCost } from "@/app/contexts/CheckoutCostContext";

const stripePromise = getStripe();

type ShippingMethod = {
  id: number;
  name: string;
  description: string;
  base_costs: string;
  estimated_days_min: number;
  estimated_days_max: number;
};

const shippingMethods: ShippingMethod[] = [
  {
    id: 1,
    name: "Standard Shipping",
    description: "Delivery in 3-5 business days",
    base_costs: "0",
    estimated_days_min: 3,
    estimated_days_max: 5,
  },
  {
    id: 2,
    name: "Express Shipping",
    description: "Delivery in 1-2 business days",
    base_costs: "10.00",
    estimated_days_min: 1,
    estimated_days_max: 2,
  },
];

interface CheckoutFormProps {
  cart: GetCartResponse;
}

function CheckoutForm({ cart }: CheckoutFormProps) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const { updateShippingCost, shippingCost, tax } = useCheckoutCost();

  const nextStep = () => {
    if (state.step === 1) {
      // Validate shipping address
      const {
        address_line1,
        city,
        state: stateValue,
        postal_code,
        country,
      } = state.addressDetail;
      if (!address_line1 || !city || !stateValue || !postal_code || !country) {
        toast.error("Please fill in all required shipping address fields");
        return;
      }
    } else if (state.step === 2) {
      // Validate shipping method
      if (!state.shippingDetail.shipping_method_id) {
        toast.error("Please select a shipping method");
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
        if (
          !address_line1 ||
          !city ||
          !stateValue ||
          !postal_code ||
          !country
        ) {
          toast.error("Please fill in all required billing address fields");
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
    const subTotal = cart.data.items.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0,
    );
    // Include tax in the total amount
    const total = subTotal + shippingCost + tax;

    try {
      const response = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_id: cart.data.cart_id,
          amount: total * 100,
        }),
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
            <div className="ml-2 font-medium">Shipping</div>
          </div>
          <div className="h-1 w-16 bg-gray-200 mx-2">
            <div
              className={`h-full ${
                state.step >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div className="ml-2 font-medium">Delivery</div>
          </div>
          <div className="h-1 w-16 bg-gray-200 mx-2">
            <div
              className={`h-full ${
                state.step >= 3 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                state.step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <div className="ml-2 font-medium">Payment</div>
          </div>
        </div>
      </div>

      {state.step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="receiver_name"
              >
                Receiver Name *
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
                required
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="receiver_phone"
              >
                Receiver Phone *
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
                required
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="address_line1"
              >
                Address Line 1 *
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
                required
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="address_line2"
              >
                Address Line 2
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="city">
                City *
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
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="state">
                State/Province *
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
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="postal_code"
              >
                Postal Code *
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
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="country"
              >
                Country *
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
                required
              />
            </div>
          </div>
        </div>
      )}

      {state.step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
          <div className="space-y-4">
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
                  deliveryDate.setDate(
                    today.getDate() + method.estimated_days_max,
                  );

                  // Update shipping method in local state
                  dispatch({
                    type: "UPDATE_SHIPPING",
                    payload: {
                      shipping_method_id: method.id,
                      estimated_delivery: deliveryDate.toISOString(),
                    },
                  });

                  // Update shipping cost in context
                  updateShippingCost(parseFloat(method.base_costs));
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                  <div className="font-medium">
                    {parseFloat(method.base_costs) === 0
                      ? "Free"
                      : `$${parseFloat(method.base_costs).toFixed(2)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Billing Address</h2>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={state.useSameForBilling}
                  onChange={() => dispatch({ type: "TOGGLE_SAME_BILLING" })}
                />
                <span>Same as shipping address</span>
              </label>
            </div>

            {!state.useSameForBilling && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_receiver_name"
                  >
                    Receiver Name *
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
                    Receiver Phone *
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
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_address_line1"
                  >
                    Address Line 1 *
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
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_address_line2"
                  >
                    Address Line 2
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
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_city"
                  >
                    City *
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
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_state"
                  >
                    State/Province *
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
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_postal_code"
                  >
                    Postal Code *
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
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="billing_country"
                  >
                    Country *
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
          <h2 className="text-xl font-bold mb-4">Payment</h2>
          {state.clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: state.clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <PaymentForm
                cart={cart}
                addressDetail={
                  state.useSameForBilling
                    ? state.addressDetail
                    : state.billingAddress
                }
                shippingDetail={state.shippingDetail}
                shippingAddress={state.addressDetail}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Preparing payment...</p>
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
            Back
          </button>
        )}
        {state.step < 3 && (
          <button
            type="submit"
            onClick={handleSubmit}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default CheckoutForm;
