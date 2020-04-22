
export type Reducer<State, Action> = (state: State, action: Action) => State

function replaceState<State, Action>(state: State, action: Action): State {
  return action as any
}

export type Observer<T> = (value: T) => void

export interface Observable<T> {
  subscribe(observer: Observer<T>): Subscription
}

export interface Store<State, Action> {
  readonly value: State
  dispatch(action: Action): void
  subscribe(observer: Observer<State>): Subscription
}

export interface Subscription {
  unsubscribe(): void
}

export function createStore<T>(state: T): Store<T, T>

export function createStore<State, Action>(
  state: State,
  reducer: Reducer<State, Action>
): Store<State, Action>

export function createStore<State, Action>(
  state: State,
  reducer: Reducer<State, Action> = replaceState
): Store<State, Action> {
  const subscribers = new Set<Observer<State>>()
  return {
    get value() { return state },
    dispatch(action) {
      state = reducer(state, action)
      subscribers.forEach(sub => sub(state))
    },
    subscribe(subscriber) {
      subscribers.add(subscriber)
      subscriber(state)
      return { unsubscribe() { subscribers.delete(subscriber) }}
    }
  }
}
