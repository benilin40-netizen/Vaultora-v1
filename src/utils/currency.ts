/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatUGX(amount: number): string {
  const num = Number(amount);
  if (!Number.isFinite(num)) {
    return 'UGX 0';
  }
  try {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(num);
  } catch (err) {
    // Fallback if en-UG locale is unsupported in some environments
    return `UGX ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
}
