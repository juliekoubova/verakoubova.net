declare module 'zbase32' {
  export function decode(str: string): Uint8Array
  export function encode(buffer: Uint8Array): string
}
