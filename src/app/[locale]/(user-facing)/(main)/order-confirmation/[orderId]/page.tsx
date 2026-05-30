import { cookies } from "next/headers";
import Image from "next/image";
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import type { OrderDetailResponse } from "@/app/types/orders";
import { verifyToken } from "@/app/utils/auth-utils";
import { formatPrice } from "@/app/utils/format-price-currency";
import { Link } from "@/i18n/navigation";
import { OrderStatusStepper } from "./components/OrderStatusStepper";

async function getOrderDetails({
  payload,
  cookies,
}: {
  payload: { orderId: string; userId: string };
  cookies: { token: string; cookieCurrency: string };
}) {
  const { orderId, userId } = payload;
  const { token, cookieCurrency } = cookies;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${orderId}?user_id=${userId}`,
    {
      method: "GET",
      headers: {
        Cookie: `token=${token}; preferred_currency=${cookieCurrency}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch order details");
  }
  const result = (await response.json()) as OrderDetailResponse;
  return result;
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string; locale: string }>;
}) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Order" });
  const tAuth = await getTranslations({ locale, namespace: "Auth" });
  const tCart = await getTranslations({ locale, namespace: "Cart" });
  const format = await getFormatter({ locale });
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";
  let isAuthenticated = false;
  let userId = "";

  if (token) {
    try {
      const decoded = await verifyToken(token);
      isAuthenticated = true;
      userId = decoded.userId.toString();
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">
          {tCart("errors.pleaseLogin")}
        </h2>
        <p className="text-lg mb-6">{tCart("errors.loginRequired")}</p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {tAuth("login.button")}
          </Link>
          <Link
            href="/register"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
          >
            {tAuth("register.button")}
          </Link>
        </div>
      </div>
    );
  }

  const { data: orderDetails, currency } = await getOrderDetails({
    payload: {
      orderId,
      userId,
    },
    cookies: {
      token,
      cookieCurrency,
    },
  });

  if (!orderDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t("errors.notFound")}</h2>
        <p className="text-lg mb-6">{t("errors.notFoundDesc")}</p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {tCart("actions.continueShopping")}
        </Link>
      </div>
    );
  }

  const { order, items, shipment } = orderDetails;
  const shippingAddress = order.shipping_address;

  const stepperLabels = {
    steps: {
      payment: t("status.steps.payment"),
      order: t("status.steps.order"),
      shipment: t("status.steps.shipment"),
    },
    values: {
      payment: {
        pending: t("status.values.payment.pending"),
        completed: t("status.values.payment.completed"),
        failed: t("status.values.payment.failed"),
        refunded: t("status.values.payment.refunded"),
      },
      order: {
        pending: t("status.values.order.pending"),
        confirmed: t("status.values.order.confirmed"),
        processing: t("status.values.order.processing"),
        shipped: t("status.values.order.shipped"),
        delivered: t("status.values.order.delivered"),
        cancelled: t("status.values.order.cancelled"),
        refunded: t("status.values.order.refunded"),
      },
      shipment: {
        pending: t("status.values.shipment.pending"),
        in_transit: t("status.values.shipment.in_transit"),
        delivered: t("status.values.shipment.delivered"),
        failed: t("status.values.shipment.failed"),
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("confirmation.title")}</h1>
        <p className="text-lg text-gray-600">{t("confirmation.thankYou")}</p>
      </div>

      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="flex flex-wrap justify-between mb-6">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              {t("details.number")}
            </h2>
            <p className="text-lg font-medium">{order.order_number}</p>
          </div>
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              {t("details.date")}
            </h2>
            <p className="text-lg font-medium">
              {format.dateTime(new Date(order.order_date), {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              {t("details.total")}
            </h2>
            <p className="text-lg font-medium">
              {formatPrice(order.total_amount, currency)}
            </p>
          </div>
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-500">
              {t("details.paymentMethod")}
            </h2>
            <p className="text-lg font-medium capitalize">
              {order.payment_provider} ({order.payment_method})
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">{t("status.label")}</h2>
          <OrderStatusStepper
            paymentStatus={order.payment_status}
            orderStatus={order.order_status}
            shipmentStatus={shipment?.shipment_status ?? null}
            labels={stepperLabels}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{t("items.title")}</h2>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex border-b pb-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="text-gray-500">
                      {t("items.quantity", { count: item.quantity })}
                    </p>
                    <p className="font-medium mt-1">
                      {formatPrice(item.unit_price, currency)} {t("items.each")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(item.total_price, currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{tCart("summary.title")}</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{tCart("summary.subtotal")}</span>
                <span>{formatPrice(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{tCart("summary.shipping")}</span>
                <span>{formatPrice(order.shipping_amount, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>{tCart("summary.tax")}</span>
                <span>{formatPrice(order.tax_amount, currency)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t("items.discount")}</span>
                  <span>{formatPrice(order.discount_amount, currency)}</span>
                </div>
              )}
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>{tCart("summary.total")}</span>
                <span>{formatPrice(order.total_amount, currency)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">{t("shippingAddress")}</h2>
            <address className="not-italic">
              <p>{shippingAddress.address_line1}</p>
              {shippingAddress.address_line2 && (
                <p>{shippingAddress.address_line2}</p>
              )}
              <p>
                {shippingAddress.city}, {shippingAddress.state}{" "}
                {shippingAddress.postal_code}
              </p>
              <p>{shippingAddress.country}</p>
            </address>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-block"
        >
          {tCart("actions.continueShopping")}
        </Link>
      </div>
    </div>
  );
}
