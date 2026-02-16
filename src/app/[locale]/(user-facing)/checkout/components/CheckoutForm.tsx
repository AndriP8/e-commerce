"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/app/components/FormField";
import { useCheckoutCost } from "@/app/contexts/CheckoutCostContext";
import type { GetCartResponse } from "@/app/types/cart";
import type { CurrencyConversion } from "@/app/types/currency";
import { useApi } from "@/app/utils/api-client";
import { formatPrice } from "@/app/utils/format-price-currency";
import { type CheckoutFormInput, checkoutFormSchema } from "@/schemas/checkout";

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

interface CheckoutFormProps {
  cart: GetCartResponse;
}

function CheckoutForm({ cart }: CheckoutFormProps) {
  const t = useTranslations("Checkout");
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingCostConversion, setShippingCostConversion] = useState(0);
  const { updateShippingCost, shippingCost, tax } = useCheckoutCost();
  const api = useApi();

  const {
    register,
    trigger,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      addressDetail: {
        address_line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        receiver_name: "",
        receiver_phone: "",
        address_type: "shipping",
      },
      useSameForBilling: true,
      billingAddress: {
        address_line1: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        receiver_name: "",
        receiver_phone: "",
        address_type: "billing",
      },
      shippingDetail: {
        shipping_method_id: "",
        estimated_delivery: "",
      },
    },
    mode: "onBlur",
  });

  const useSameForBilling = useWatch({ control, name: "useSameForBilling" });
  const selectedShippingMethodId = useWatch({
    control,
    name: "shippingDetail.shipping_method_id",
  });

  const shippingMethods: ShippingMethod[] = useMemo(
    () => [
      {
        id: "1",
        name: t("shippingMethods.standard.name"),
        description: t("shippingMethods.standard.description"),
        base_costs: 0,
        currency_id: "USD",
        min_days: 3,
        max_days: 5,
      },
      {
        id: "2",
        name: t("shippingMethods.express.name"),
        description: t("shippingMethods.express.description"),
        base_costs: 10,
        currency_id: "USD",
        min_days: 1,
        max_days: 2,
      },
    ],
    [t],
  );

  const nextStep = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await trigger("addressDetail");
    } else if (step === 2) {
      const isShippingValid = await trigger("shippingDetail");
      let isBillingValid = true;
      if (!useSameForBilling) {
        isBillingValid = await trigger("billingAddress");
      }
      isValid = isShippingValid && isBillingValid;

      if (isValid) {
        await createPaymentIntent();
      }
    }

    if (isValid) {
      setStep(step + 1);
    } else {
      toast.error(
        t("errors.fixValidationIssues") ||
          "Please fix validation issues before continuing",
      );
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const createPaymentIntent = async () => {
    setIsLoading(true);
    const subTotal = cart.data.items.reduce(
      (sum, item) => sum + item.total_price,
      0,
    );
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
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast.error(`Error creating payment: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
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

  // Render Step 1 Content
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">{t("address.shipping")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={t("address.receiverName")}
          placeholder={t("address.receiverName")}
          registration={register("addressDetail.receiver_name")}
          error={errors.addressDetail?.receiver_name}
          containerClassName="col-span-2"
          autoComplete="shipping name"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.receiverPhone")}
          placeholder={t("address.receiverPhone")}
          registration={register("addressDetail.receiver_phone")}
          error={errors.addressDetail?.receiver_phone}
          containerClassName="col-span-2"
          autoComplete="shipping tel"
          type="tel"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.addressLine1")}
          placeholder={t("address.addressLine1")}
          registration={register("addressDetail.address_line1")}
          error={errors.addressDetail?.address_line1}
          containerClassName="col-span-2"
          autoComplete="shipping address-line1"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.addressLine2")}
          placeholder={t("address.addressLine2")}
          registration={register("addressDetail.address_line2")}
          error={errors.addressDetail?.address_line2}
          containerClassName="col-span-2"
          autoComplete="shipping address-line2"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.city")}
          placeholder={t("address.city")}
          registration={register("addressDetail.city")}
          error={errors.addressDetail?.city}
          autoComplete="shipping address-level2"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.state")}
          placeholder={t("address.state")}
          registration={register("addressDetail.state")}
          error={errors.addressDetail?.state}
          autoComplete="shipping address-level1"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.postalCode")}
          placeholder={t("address.postalCode")}
          registration={register("addressDetail.postal_code")}
          error={errors.addressDetail?.postal_code}
          autoComplete="shipping postal-code"
          schema={checkoutFormSchema}
        />
        <FormField
          label={t("address.country")}
          placeholder={t("address.country")}
          registration={register("addressDetail.country")}
          error={errors.addressDetail?.country}
          autoComplete="shipping country"
          schema={checkoutFormSchema}
        />
      </div>
    </div>
  );

  // Render Step 2 Content
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">{t("shippingMethods.title")}</h2>
      <div className="space-y-4">
        {shippingMethods.map((method) => (
          <label
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all block relative ${
              selectedShippingMethodId === method.id
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "hover:border-gray-400"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              value={method.id}
              checked={selectedShippingMethodId === method.id}
              onChange={() => {
                const today = new Date();
                const deliveryDate = new Date(today);
                deliveryDate.setDate(today.getDate() + method.max_days);

                setValue("shippingDetail.shipping_method_id", method.id, {
                  shouldValidate: true,
                });
                setValue(
                  "shippingDetail.estimated_delivery",
                  deliveryDate.toISOString(),
                );

                updateShippingCost(
                  method.base_costs === 0
                    ? method.base_costs
                    : shippingCostConversion,
                );
              }}
            />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className="font-bold text-blue-600">
                {method.base_costs === 0
                  ? t("summary.free")
                  : formatPrice(shippingCostConversion, cart.currency)}
              </div>
            </div>
          </label>
        ))}
        {errors.shippingDetail?.shipping_method_id && (
          <p className="text-sm text-red-600">
            {errors.shippingDetail.shipping_method_id.message}
          </p>
        )}
      </div>

      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-bold mb-4">{t("address.billing")}</h2>
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="same_billing_address"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            {...register("useSameForBilling")}
          />
          <label
            htmlFor="same_billing_address"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {t("address.sameAsBilling")}
          </label>
        </div>

        {!useSameForBilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <FormField
              label={t("address.receiverName")}
              placeholder={t("address.receiverName")}
              registration={register("billingAddress.receiver_name")}
              error={errors.billingAddress?.receiver_name}
              containerClassName="col-span-2"
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.receiverPhone")}
              placeholder={t("address.receiverPhone")}
              registration={register("billingAddress.receiver_phone")}
              error={errors.billingAddress?.receiver_phone}
              containerClassName="col-span-2"
              type="tel"
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.addressLine1")}
              placeholder={t("address.addressLine1")}
              registration={register("billingAddress.address_line1")}
              error={errors.billingAddress?.address_line1}
              containerClassName="col-span-2"
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.addressLine2")}
              placeholder={t("address.addressLine2")}
              registration={register("billingAddress.address_line2")}
              error={errors.billingAddress?.address_line2}
              containerClassName="col-span-2"
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.city")}
              placeholder={t("address.city")}
              registration={register("billingAddress.city")}
              error={errors.billingAddress?.city}
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.state")}
              placeholder={t("address.state")}
              registration={register("billingAddress.state")}
              error={errors.billingAddress?.state}
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.postalCode")}
              placeholder={t("address.postalCode")}
              registration={register("billingAddress.postal_code")}
              error={errors.billingAddress?.postal_code}
              schema={checkoutFormSchema}
            />
            <FormField
              label={t("address.country")}
              placeholder={t("address.country")}
              registration={register("billingAddress.country")}
              error={errors.billingAddress?.country}
              schema={checkoutFormSchema}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div className="ml-2 font-medium">{t("steps.shipping")}</div>
          </div>
          <div className="h-1 flex-1 bg-gray-200 mx-4">
            <div
              className={`h-full transition-all duration-300 ${step >= 2 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"}`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <div className="ml-2 font-medium">{t("steps.delivery")}</div>
          </div>
          <div className="h-1 flex-1 bg-gray-200 mx-4">
            <div
              className={`h-full transition-all duration-300 ${step >= 3 ? "bg-blue-600 w-full" : "bg-gray-200 w-0"}`}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <div className="ml-2 font-medium">{t("steps.payment")}</div>
          </div>
        </div>
      </div>

      {step < 3 ? (
        <form
          onSubmit={(e) => {
            console.log("asd");
            e.preventDefault();
            nextStep();
          }}
          className="space-y-6"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}

          <div className="mt-12 flex justify-between border-t pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {t("actions.back")}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("actions.loading") || "Loading..."}
                </span>
              ) : (
                `${t("actions.continue")} sasd`
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold mb-4">{t("steps.payment")}</h2>
            {clientSecret ? (
              <StripePaymentSection
                clientSecret={clientSecret}
                cart={cart}
                addressDetail={
                  useSameForBilling
                    ? getValues("addressDetail")
                    : // biome-ignore lint/style/noNonNullAssertion: billingAddress is required when useSameForBilling is false
                      getValues("billingAddress")!
                }
                shippingDetail={getValues("shippingDetail")}
                shippingAddress={getValues("addressDetail")}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">
                  {t("actions.preparingPayment")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-between border-t pt-6">
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {t("actions.back")}
            </button>
            {/* Note: No continue button here for Step 3 as the Stripe form handles submission */}
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutForm;
