export function then<
  Args extends any[],
  Context,
  F extends (this: Context, ...args: Args) => void,
  >(...fns: F[]) {
  return function thenChain(this: Context, ...args: Args): void {
    for (const fn of fns) {
      fn.apply(this, args)
    }
  }
}