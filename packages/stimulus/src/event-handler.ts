import { Controller } from "@stimulus/core";
import { wrapController } from "./wrapper";

export function makeEventHandler(
  controller: Controller,
  target: EventTarget,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions
) {
  wrapController(
    controller,
    () => target.addEventListener(type, handler, options),
    () => target.removeEventListener(type, handler, options)
  )
}