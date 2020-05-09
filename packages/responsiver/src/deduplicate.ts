export function deduplicate(
  values: Iterable<number>,
  minStep: number
) {
  const sorted = [...new Set(values)].sort((a, b) => b - a)
  const result = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    if ((result[result.length - 1] / sorted[i]) > minStep) {
      result.push(sorted[i])
    }
  }

  return result.reverse()
}