import { GetCartResponse } from "@/app/types/cart";
import { AddressDetail, ShippingDetail } from "./checkoutReducer";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCheckoutCost } from "@/app/contexts/CheckoutCostContext";
import { formatPrice } from "@/app/utils/format-price-currency";

interface PaymentFormProps {
  cart: GetCartResponse;
  addressDetail: AddressDetail;
  shippingDetail: ShippingDetail;
  shippingAddress: AddressDetail;
}

export default function PaymentForm({
  cart,
  addressDetail,
  shippingDetail,
  shippingAddress,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { shippingCost, tax } = useCheckoutCost();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the order first
      const orderResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_id: cart.data.cart_id,
          address_detail: addressDetail,
          shipping_detail: shippingDetail,
          shipping_address: shippingAddress,
          payment_detail: {
            payment_method: "card",
            payment_provider: "stripe",
          },
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await orderResponse.json();

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderData.order_id}`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded, update the order payment status
        const updatePaymentResponse = await fetch(
          `/api/checkout/update-payment/${orderData.order_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transaction_id: paymentIntent.id,
              payment_status: "completed",
            }),
          },
        );

        if (!updatePaymentResponse.ok) {
          console.error("Failed to update payment status");
        }

        try {
          await fetch(`/api/cart/clear`, {
            method: "DELETE",
          });
        } catch (cartError) {
          console.error("Failed to clear cart:", cartError);
        }

        toast.success("Payment successful!");
        router.push(`/order-confirmation/${orderData.order_id}`);
      }
    } catch (err) {
      setError(`Payment failed: ${(err as Error).message}`);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subTotal = cart.data.items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

  const total = subTotal + shippingCost + tax;

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4" id="payment-section-title">
        Payment Information
      </h2>
      <div aria-labelledby="payment-section-title">
        <PaymentElement />
      </div>
      {error && (
        <div className="text-red-600 mt-4" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        aria-label={`Pay ${formatPrice(total, cart.currency)}`}
        aria-busy={loading}
        aria-disabled={!stripe || loading}
      >
        {loading ? (
          <span className="flex items-center justify-center" aria-hidden="true">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Loading indicator"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${formatPrice(total, cart.currency)}`
        )}
      </button>
    </form>
  );
}
