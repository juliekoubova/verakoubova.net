import { Controller } from "@stimulus/core";
import { then } from './then'

export function wrapController(
  controller: Controller,
  connect: () => void,
  disconnect?: () => void,
): void {
  const { connect: prevConnect, disconnect: prevDisconnect } = controller
  controller.connect = then(connect, prevConnect)
  if (disconnect) {
    controller.disconnect = then(prevDisconnect, disconnect)
  }
}