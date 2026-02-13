import { pool } from "@/app/db/client";
import { Currencies } from "@/schemas/db-schemas";
import { cookies } from "next/headers";

// In-memory cache for exchange rates (1 hour TTL)
const exchangeRateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

/**
 * Get all active currencies
 */
export async function getCurrencies(): Promise<Currencies[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM currencies WHERE is_active = true ORDER BY id",
    );
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get currency by code
 */
export async function getCurrencyByCode(code: string): Promise<Currencies | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM currencies WHERE code = $1 AND is_active = true",
      [code],
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Get exchange rate between two currencies (with caching)
 */
export async function getExchangeRate(
  fromCurrencyCode: string,
  toCurrencyCode: string,
): Promise<number> {
  if (fromCurrencyCode === toCurrencyCode) {
    return 1.0;
  }

  const cacheKey = `${fromCurrencyCode}_${toCurrencyCode}`;
  const cached = exchangeRateCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rate;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT er.rate 
       FROM exchange_rates er
       JOIN currencies c1 ON er.from_currency_id = c1.id
       JOIN currencies c2 ON er.to_currency_id = c2.id
       WHERE c1.code = $1 AND c2.code = $2
       ORDER BY er.effective_date DESC
       LIMIT 1`,
      [fromCurrencyCode, toCurrencyCode],
    );

    if (result.rows.length > 0) {
      const rate = parseFloat(result.rows[0].rate);
      exchangeRateCache.set(cacheKey, { rate, timestamp: Date.now() });
      return rate;
    }

    // If direct rate not found, try reverse rate
    const reverseResult = await client.query(
      `SELECT (1.0 / er.rate) as rate
       FROM exchange_rates er
       JOIN currencies c1 ON er.from_currency_id = c1.id
       JOIN currencies c2 ON er.to_currency_id = c2.id
       WHERE c1.code = $2 AND c2.code = $1
       ORDER BY er.effective_date DESC
       LIMIT 1`,
      [fromCurrencyCode, toCurrencyCode],
    );

    if (reverseResult.rows.length > 0) {
      const rate = parseFloat(reverseResult.rows[0].rate);
      exchangeRateCache.set(cacheKey, { rate, timestamp: Date.now() });
      return rate;
    }

    throw new Error(`Exchange rate not found for ${fromCurrencyCode} to ${toCurrencyCode}`);
  } finally {
    client.release();
  }
}

/**
 * Convert price from one currency to another
 */
export async function convertPrice(
  amount: number,
  fromCurrencyCode: string,
  toCurrencyCode: string,
): Promise<number> {
  const rate = await getExchangeRate(fromCurrencyCode, toCurrencyCode);
  return amount * rate;
}

/**
 * Get user's preferred currency
 */
export async function getUserPreferredCurrency(userId?: string): Promise<Currencies> {
  const cookieStore = await cookies();
  const prefered_currency = cookieStore.get("preferred_currency")?.value || "USD";
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT c.id, c.code, c.name, c.symbol, c.decimal_places, c.locales, c.is_active
       FROM user_preferences up
       JOIN currencies c ON up.preferred_currency_id = c.id
       WHERE up.user_id = $1 OR c.code = $2`,
      [userId, prefered_currency],
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Return USD as default if no preference found
    return (await getCurrencyByCode(prefered_currency)) as Currencies;
  } finally {
    client.release();
  }
}

/**
 * Update user's preferred currency
 */
export async function updateUserPreferredCurrency(
  userId: string,
  currencyCode: string,
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get currency ID
    const currencyResult = await client.query(
      "SELECT id FROM currencies WHERE code = $1 AND is_active = true",
      [currencyCode],
    );

    if (currencyResult.rows.length === 0) {
      throw new Error(`Invalid currency code: ${currencyCode}`);
    }

    const currencyId = currencyResult.rows[0].id;

    // Upsert user preference
    await client.query(
      `INSERT INTO user_preferences (user_id, preferred_currency_id, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET preferred_currency_id = $2, updated_at = CURRENT_TIMESTAMP`,
      [userId, currencyId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
