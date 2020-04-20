import { Controller } from "stimulus";
import { makeEventHandler } from "./event-handler";
import { wrapController } from "./wrapper";

export function makeResizer(controller: Controller, handler: () => void) {
  makeEventHandler(controller, window, 'resize', handler, { passive: true })
  makeEventHandler(controller, window, 'orientationchange', handler, { passive: true })
  wrapController(controller, () => setTimeout(handler, 0))
}