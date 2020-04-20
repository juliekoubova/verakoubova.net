export function stripHash(s: string) {
  return s.replace(/^#/, '')
}

export function hashEqual(a: string, b: string) {
  return stripHash(a) === stripHash(b)
}

export function getHash(url: string) {
  const m = /(#.*)$/.exec(url)
  return m && m[1] || '#'
}