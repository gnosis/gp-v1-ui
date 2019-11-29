import { Reducer } from 'react'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Action<T = any> {
  type: T
}

export type ReducersMapObject<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>
}

export type StateFromReducersMapObject<M> = M extends ReducersMapObject<any, any>
  ? { [P in keyof M]: M[P] extends Reducer<infer S, any> ? S : never }
  : never

function getUndefinedStateErrorMessage(key: string, action: Action): string {
  const actionType = action && action.type
  const actionDescription = (actionType && `action "${String(actionType)}"`) || 'an action'

  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  )
}

export default function combineReducers(
  reducers: ReducersMapObject,
): (
  state:
    | {
        [x: string]: any
      }
    | undefined,
  action: Action<any>,
) => {
  [x: string]: any
} {
  const reducerKeys = Object.keys(reducers)
  const finalReducers: ReducersMapObject = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        console.warn(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  return function combination(
    state: StateFromReducersMapObject<typeof reducers> = {},
    action: Action,
  ): { [x: string]: any } {
    let hasChanged = false
    const nextState: StateFromReducersMapObject<typeof reducers> = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }
}
