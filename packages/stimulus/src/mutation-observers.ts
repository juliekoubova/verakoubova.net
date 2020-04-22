import { Controller } from "@stimulus/core";
import {
  AttributeObserverDelegate, AttributeObserver,
  ElementObserver, ElementObserverDelegate
} from "@stimulus/mutation-observers";
import { wrapController } from "./wrapper";
import { then } from "./then";

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

type Truthy<T> = Exclude<T, undefined | null | false | 0 | ''>

function isTruthy<T>(x: T): x is Truthy<T> {
  return !!x
}

export function combineAttributeObserverDelegates(
  ...delegates: AttributeObserverDelegate[]
): AttributeObserverDelegate {
  return {
    elementAttributeValueChanged: then(
      ...delegates.map(d => d.elementAttributeValueChanged).filter(isTruthy)
    ),
    elementMatchedAttribute: then(
      ...delegates.map(d => d.elementMatchedAttribute).filter(isTruthy)
    ),
    elementUnmatchedAttribute: then(
      ...delegates.map(d => d.elementUnmatchedAttribute).filter(isTruthy)
    ),
  }
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