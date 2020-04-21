import { Controller } from "@stimulus/core";
import { AttributeObserverDelegate, AttributeObserver, ElementObserver, ElementObserverDelegate  } from "@stimulus/mutation-observers";
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

export function makeElementObserver(
  controller: Controller,
  delegate: ElementObserverDelegate,
) {
  let observer: ElementObserver | undefined
  wrapController(
    controller,
    () => {
      observer = new ElementObserver(controller.element, delegate)
      observer.start()
    }
  )
}