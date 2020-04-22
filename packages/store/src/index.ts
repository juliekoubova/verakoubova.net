
export type Reducer<State, Action> = (state: State, action: Action) => State
export type Subscriber<T> = (state: T) => void

export interface Subscription {
  unsubscribe(): void
}

export interface Store<State, Action> {
  readonly state: State
  dispatch(action: Action): void
  subscribe(subscriber: Subscriber<State>): Subscription
}

function replaceState<State, Action>(state: State, action: Action) {
  return action as unknown as State
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
  let subscribers: Subscriber<State>[] = []
  return {
    get state() { return state },
    dispatch(action: Action) {
      state = reducer(state, action)
      subscribers.forEach(sub => sub(state))
    },
    subscribe(subscriber: Subscriber<State>) {
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