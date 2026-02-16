"use client";

import { useTranslations } from "next-intl";

interface QuantitySelectorProps {
  quantity: number | string;
  onQuantityChange: (quantity: string) => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  disabled?: boolean;
  productName?: string;
  min?: number;
  max?: number;
  className?: string;
}

export default function QuantitySelector({
  quantity,
  onQuantityChange,
  onIncrement,
  onDecrement,
  disabled = false,
  productName = "product",
  min = 1,
  max = 999,
  className = "",
}: QuantitySelectorProps) {
  const tA11y = useTranslations("Accessibility");

  const numericQuantity = Number(quantity);
  const isDecrementDisabled = disabled || numericQuantity <= min;
  const isIncrementDisabled = disabled || numericQuantity >= max;

  const handleDecrement = () => {
    if (isDecrementDisabled) return;

    if (onDecrement) {
      onDecrement();
    } else {
      const newQuantity = Math.max(min, numericQuantity - 1);
      onQuantityChange(newQuantity.toString());
    }
  };

  const handleIncrement = () => {
    if (isIncrementDisabled) return;

    if (onIncrement) {
      onIncrement();
    } else {
      const newQuantity = Math.min(max, numericQuantity + 1);
      onQuantityChange(newQuantity.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQuantityChange(value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || Number(value) < min) {
      onQuantityChange(min.toString());
    } else if (Number(value) > max) {
      onQuantityChange(max.toString());
    }
  };

  return (
    <fieldset
      className={`flex items-center gap-0 ${className}`}
      aria-label={tA11y("quantityFor", { product: productName })}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        aria-disabled={isDecrementDisabled}
        aria-label={tA11y("decreaseQuantity", { product: productName })}
        className="w-10 h-10 border border-gray-300 rounded-l-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
      >
        <span aria-hidden="true" className="text-lg font-medium">
          −
        </span>
      </button>

      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        aria-label={tA11y("quantityFor", { product: productName })}
        className="w-16 h-10 border-t border-b border-gray-300 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
        min={min}
        max={max}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        aria-disabled={isIncrementDisabled}
        aria-label={tA11y("increaseQuantity", { product: productName })}
        className="w-10 h-10 border border-gray-300 rounded-r-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
      >
        <span aria-hidden="true" className="text-lg font-medium">
          +
        </span>
      </button>
    </fieldset>
  );
}
