export function getHash(s: string) {
  return s.replace(/^.*#/, '')
}

export function hashEqual(a: string, b: string) {
  return getHash(a) === getHash(b)
}
