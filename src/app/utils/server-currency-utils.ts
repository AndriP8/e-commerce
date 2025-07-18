import { getCurrencyByCode, getExchangeRate } from "./currency-utils";

/**
 * Convert a single price from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency The currency code to convert from
 * @param toCurrency The currency code to convert to
 * @returns The converted amount
 */
export async function convertSinglePrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<number> {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get the exchange rate
  const rate = await getExchangeRate(fromCurrency, toCurrency);

  // Convert the amount
  return amount * rate;
}

/**
 * Convert product prices from base currency to target currency
 * @param products Array of product objects with price fields
 * @param targetCurrency The currency code to convert to
 * @param baseCurrency The currency code to convert from (default: 'USD')
 * @returns Products with converted prices
 */
export async function convertProductPrices<
  T extends { base_price: number; discount_price?: number | null },
>(
  products: T[],
  targetCurrency: string,
  baseCurrency: string = "USD",
): Promise<T[]> {
  // If currencies are the same, no conversion needed
  if (baseCurrency === targetCurrency) {
    return products;
  }

  // Get the target currency details
  const currency = await getCurrencyByCode(targetCurrency);
  if (!currency) {
    throw new Error(`Invalid currency code: ${targetCurrency}`);
  }

  // Get the exchange rate
  const rate = await getExchangeRate(baseCurrency, targetCurrency);

  // Convert prices for all products
  return products.map((product) => {
    const convertedProduct = { ...product };

    // Convert base price
    convertedProduct.base_price = Number(
      (product.base_price * rate).toFixed(2),
    );

    // Convert discount price if it exists
    if (
      product.discount_price !== undefined &&
      product.discount_price !== null
    ) {
      convertedProduct.discount_price = Number(
        (product.discount_price * rate).toFixed(2),
      );
    }

    return convertedProduct;
  });
}

/**
 * Convert cart prices from base currency to target currency
 * @param cart Cart object with items that have price fields
 * @param targetCurrency The currency code to convert to
 * @param baseCurrency The currency code to convert from (default: 'USD')
 * @returns Cart with converted prices
 */
export async function convertCartPrices<
  T extends {
    items: Array<{ unit_price: number; total_price: number }>;
    total_price: number;
  },
>(cart: T, targetCurrency: string, baseCurrency: string = "USD"): Promise<T> {
  // If currencies are the same, no conversion needed
  if (baseCurrency === targetCurrency) {
    return cart;
  }

  // Get the target currency details
  const currency = await getCurrencyByCode(targetCurrency);
  if (!currency) {
    throw new Error(`Invalid currency code: ${targetCurrency}`);
  }

  // Get the exchange rate
  const rate = await getExchangeRate(baseCurrency, targetCurrency);

  // Create a new cart object to avoid mutating the original
  const convertedCart = { ...cart };

  // Convert prices for all items
  convertedCart.items = cart.items.map((item) => {
    const convertedItem = { ...item };
    convertedItem.unit_price = Number((item.unit_price * rate).toFixed(2));
    convertedItem.total_price = Number((item.total_price * rate).toFixed(2));
    return convertedItem;
  });

  // Convert total price
  convertedCart.total_price = Number((cart.total_price * rate).toFixed(2));

  return convertedCart;
}

/**
 * Convert order prices from base currency to target currency
 * @param order Order object with price fields
 * @param items Order items with price fields
 * @param targetCurrency The currency code to convert to
 * @param baseCurrency The currency code to convert from (default: 'USD')
 * @returns Order and items with converted prices
 */
export async function convertOrderPrices<
  T extends {
    subtotal: string;
    tax_amount: string;
    shipping_amount: string;
    total_amount: string;
  },
  U extends Array<{ unit_price: string; total_price: string }>,
>(
  order: T,
  items: U,
  targetCurrency: string,
  baseCurrency: string = "USD",
): Promise<{ order: T; items: U }> {
  // If currencies are the same, no conversion needed
  if (baseCurrency === targetCurrency) {
    return { order, items };
  }

  // Get the target currency details
  const currency = await getCurrencyByCode(targetCurrency);
  if (!currency) {
    throw new Error(`Invalid currency code: ${targetCurrency}`);
  }

  // Get the exchange rate
  const rate = await getExchangeRate(baseCurrency, targetCurrency);

  // Create new objects to avoid mutating the originals
  const convertedOrder = { ...order };

  // Convert order prices
  convertedOrder.subtotal = (parseFloat(order.subtotal) * rate).toFixed(2);
  convertedOrder.tax_amount = (parseFloat(order.tax_amount) * rate).toFixed(2);
  convertedOrder.shipping_amount = (
    parseFloat(order.shipping_amount) * rate
  ).toFixed(2);
  convertedOrder.total_amount = (parseFloat(order.total_amount) * rate).toFixed(
    2,
  );

  // Convert prices for all items
  const convertedItems = items.map((item) => {
    const convertedItem = { ...item };
    convertedItem.unit_price = (parseFloat(item.unit_price) * rate).toFixed(2);
    convertedItem.total_price = (parseFloat(item.total_price) * rate).toFixed(
      2,
    );
    return convertedItem;
  }) as U;

  return { order: convertedOrder, items: convertedItems };
}
