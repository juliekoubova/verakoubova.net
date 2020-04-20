import { Controller } from "@stimulus/core";
import { AttributeObserverDelegate, AttributeObserver } from "@stimulus/mutation-observers";
import { wrapController } from "./wrapper";

export function makeAttributeObserver(
  controller: Controller,
  attributeName: string,
  delegate: AttributeObserverDelegate,
) {
  let observer: AttributeObserver | undefined
  wrapController(
    controller,
    () => {
      observer = new AttributeObserver(controller.element, attributeName, delegate)
      observer.start()
    },
    () => observer?.stop()
  )
}