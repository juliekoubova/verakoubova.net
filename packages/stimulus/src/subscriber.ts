import { Controller } from "@stimulus/core";
import { Subscription, Observable } from '@verakoubova/store'
import { wrapController } from "./wrapper";

export function makeSubscriber<T, TController extends Controller>(
  controller: TController,
  observable: Observable<T> ,
  next: (this: TController, value: T) => void
) {
  let subscription: Subscription | undefined
  wrapController(
    controller,
    () => subscription = observable.subscribe(
      value => next.call(controller, value)
    ),
    () => subscription?.unsubscribe()
  )
}