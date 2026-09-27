// Returns a percentage clamped to [0, 100], safe against zero division.
export function calcPercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.min(Math.max((value / total) * 100, 0), 100);
}
