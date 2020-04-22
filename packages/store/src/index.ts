import { BehaviorSubject } from 'rxjs'

export type Reducer<State, Action> = (state: State, action: Action) => State

function replaceState<State, Action>(state: State, action: Action): State {
  return action as any
}

export class Store<State, Action> extends BehaviorSubject<State>{
  constructor(
    initialState: State,
    private readonly reducer: Reducer<State, Action>,
  ) {
    super(initialState)
  }

  dispatch(action: Action) {
    const next = this.reducer(this.value, action)
    this.next(next)
  }
}

export function createStore<T>(state: T): Store<T, T>

export function createStore<State, Action>(
  state: State,
  reducer: Reducer<State, Action>
): Store<State, Action>

export function createStore<State, Action>(
  initialState: State,
  reducer: Reducer<State, Action> = replaceState
): Store<State, Action> {
  return new Store(initialState, reducer)
}
