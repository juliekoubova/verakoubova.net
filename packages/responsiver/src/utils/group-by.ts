export function groupBy<K, T>(items: T[], groupBy: (item: T) => K): Map<K, T[]> {
  const result = new Map<K, T[]>();
  for (const item of items) {
    const key = groupBy(item);
    const array = result.get(key);
    if (array) {
      array.push(item);
    }
    else {
      result.set(key, [item]);
    }
  }
  return result;
}
