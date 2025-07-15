/**
 * Tax utility functions for consistent tax calculations across the application
 */

export const TAX_RATE = 0.1; // 10% tax rate

/**
 * Calculate tax amount based on a subtotal
 * @param subtotal The amount to calculate tax on
 * @returns The calculated tax amount
 */
export function calculateTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}