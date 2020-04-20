import { Controller } from "@stimulus/core";

function then<T>(
  context: unknown,
  a: (...args: unknown[]) => void,
  b: (...args: unknown[]) => T,
) {
  return (...args: unknown[]) => {
    a.apply(context, args)
    return b.apply(context, args)
  }
}

export function wrapController(
  controller: Controller,
  connect: () => void,
  disconnect?: () => void,
): void {
  const { connect: prevConnect, disconnect: prevDisconnect } = controller
  controller.connect = then(controller, connect, prevConnect)
  if (disconnect) {
    controller.disconnect = then(controller, prevDisconnect, disconnect)
  }
}