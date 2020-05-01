import { sortBy } from "./sort-by";

export function tryFindAtLeast<T>(
  items: Iterable<T>,
  selector: (item: T) => number,
  minimum: number
) {
  const sorted = sortBy(items, selector)
  if (sorted.length === 0) {
    throw new Error('Expected a non-empty iterable')
  }
  return sorted.length === 1
    ? sorted[0]
    : sorted.find(i => selector(i) >= minimum) ?? sorted[sorted.length - 1]
}