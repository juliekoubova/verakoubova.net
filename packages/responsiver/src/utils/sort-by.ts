export function sortBy<T>(items: Iterable<T>, fn: (value: T) => number) {
  return [...items].sort((a, b) => fn(a) - fn(b));
}
