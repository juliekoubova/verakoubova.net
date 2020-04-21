import { Controller } from "@stimulus/core";
import { Subscription } from "@verakoubova/store"
import { wrapController } from "./wrapper";

export function makeSubscriber(
  controller: Controller,
  subscriber: () => Subscription,
) {
  let subscription: Subscription | undefined
  wrapController(
    controller,
    () => subscription = subscriber(),
    () => subscription?.unsubscribe()
  )
}