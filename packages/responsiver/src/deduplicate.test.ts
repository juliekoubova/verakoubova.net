import { deduplicate } from "./deduplicate"

it('removes duplicate values', () => {
  const actual = deduplicate([10, 10, 12, 12, 12], 1.1)
  expect(actual).toStrictEqual([10, 12])
})
it('removes middle values', () => {
  const actual = deduplicate([10, 11, 12, 13, 14], 1.1)
  expect(actual).toStrictEqual([10, 12, 14])
})