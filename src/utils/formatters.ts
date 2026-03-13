/**
 * Format a numeric modifier with +/- prefix.
 * Returns '—' for undefined/null values.
 */
export function formatMod(n: number | undefined | null): string {
  if (n === undefined || n === null) return '—';
  return n >= 0 ? `+${n}` : `${n}`;
}
