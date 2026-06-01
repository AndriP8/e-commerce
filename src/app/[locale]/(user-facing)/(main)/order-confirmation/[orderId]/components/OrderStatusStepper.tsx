import type React from "react";
import type {
  OrderStatusEnum,
  PaymentStatusEnum,
  ShipmentStatusEnum,
} from "@/schemas/db-schemas";

type StepState = "done" | "active" | "upcoming" | "failed";

interface StepConfig {
  name: string;
  subtitle: string;
  state: StepState;
}

interface Props {
  paymentStatus: PaymentStatusEnum | null;
  orderStatus: OrderStatusEnum | null;
  shipmentStatus: ShipmentStatusEnum | null;
  labels: {
    steps: { payment: string; order: string; shipment: string };
    values: {
      payment: Record<string, string>;
      order: Record<string, string>;
      shipment: Record<string, string>;
    };
  };
}

function deriveSteps(
  paymentStatus: PaymentStatusEnum | null,
  orderStatus: OrderStatusEnum | null,
  shipmentStatus: ShipmentStatusEnum | null,
  labels: Props["labels"],
): [StepConfig, StepConfig, StepConfig] {
  const paymentDone = paymentStatus === "completed";
  const orderDone =
    paymentDone &&
    (orderStatus === "confirmed" ||
      orderStatus === "processing" ||
      orderStatus === "shipped" ||
      orderStatus === "delivered");

  const paymentState: StepState =
    paymentStatus === "failed" || paymentStatus === "refunded"
      ? "failed"
      : paymentDone
        ? "done"
        : "active";

  const orderState: StepState = !paymentDone
    ? "upcoming"
    : orderStatus === "cancelled" || orderStatus === "refunded"
      ? "failed"
      : orderDone
        ? "done"
        : "active";

  const shipmentState: StepState = !orderDone
    ? "upcoming"
    : shipmentStatus === "failed"
      ? "failed"
      : shipmentStatus === "delivered"
        ? "done"
        : "active";

  return [
    {
      name: labels.steps.payment,
      subtitle:
        labels.values.payment[paymentStatus ?? "pending"] ??
        paymentStatus ??
        "pending",
      state: paymentState,
    },
    {
      name: labels.steps.order,
      subtitle:
        labels.values.order[orderStatus ?? "pending"] ??
        orderStatus ??
        "pending",
      state: orderState,
    },
    {
      name: labels.steps.shipment,
      subtitle:
        labels.values.shipment[shipmentStatus ?? "pending"] ??
        shipmentStatus ??
        "pending",
      state: shipmentState,
    },
  ];
}

const iconStyle: Record<StepState, string> = {
  done: "bg-green-500 text-white",
  active: "bg-blue-600 text-white ring-4 ring-blue-100",
  upcoming: "bg-gray-100 text-gray-400 border-2 border-gray-200",
  failed: "bg-red-500 text-white",
};

const labelStyle: Record<StepState, string> = {
  done: "text-green-600",
  active: "text-blue-600",
  upcoming: "text-gray-400",
  failed: "text-red-500",
};

function StepIcon({ state, index }: { state: StepState; index: number }) {
  const base =
    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0";

  if (state === "done") {
    return (
      <div className={`${base} ${iconStyle.done}`}>
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className={`${base} ${iconStyle.failed}`}>
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
    );
  }

  return <div className={`${base} ${iconStyle[state]}`}>{index + 1}</div>;
}

export function OrderStatusStepper({
  paymentStatus,
  orderStatus,
  shipmentStatus,
  labels,
}: Props) {
  const steps = deriveSteps(paymentStatus, orderStatus, shipmentStatus, labels);

  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    nodes.push(
      <div key={step.name} className="flex flex-col items-center shrink-0 w-24">
        <StepIcon state={step.state} index={i} />
        <div className="mt-2 text-center">
          <p className={`text-sm font-semibold ${labelStyle[step.state]}`}>
            {step.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{step.subtitle}</p>
        </div>
      </div>,
    );
    if (i < steps.length - 1) {
      nodes.push(
        <div
          key={`connector-${i}`}
          className={`flex-1 h-0.5 self-start mt-5 mx-1 ${
            step.state === "done" ? "bg-green-500" : "bg-gray-300"
          }`}
        />,
      );
    }
  }

  return <div className="flex items-center w-full py-2">{nodes}</div>;
}
