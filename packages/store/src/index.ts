
export type Subscriber<T> = (state: T) => void

export interface Subscription {
  unsubscribe(): void
}

export interface Store<T> {
  readonly state: T
  dispatch(newState: T): void
  subscribe(subscriber: Subscriber<T>): Subscription
}

export function createStore<T>(state: T): Store<T> {

  let subscribers: Subscriber<T>[] = []

  return {
    get state() { return state },
    dispatch(newState: T) {
      state = newState
      subscribers.forEach(sub => sub(state))
    },
    subscribe(subscriber: Subscriber<T>) {
      subscribers.push(subscriber)
      subscriber(state)
      return {
        unsubscribe() {
          subscribers = subscribers.filter(s => s !== subscriber)
        }
      }
    }
  }
}