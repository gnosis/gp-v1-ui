import { Actions } from 'reducers-actions'

export interface LocalTokensState {
  disabled: Set<string>
}

export const enum ActionTypes {
  ENABLE_TOKEN = 'ENABLE_TOKEN',
  DISABLE_TOKEN = 'DISABLE_TOKEN',
  UPDATE_ALL_DISABLED = 'UPDATE_ALL_DISABLED',
}

interface TokenAddressPayload {
  tokenAddress: string
}

type EnableLocalToken = Actions<ActionTypes.ENABLE_TOKEN, TokenAddressPayload>
type DisableLocalToken = Actions<ActionTypes.DISABLE_TOKEN, TokenAddressPayload>
type UpdateAllDisabled = Actions<ActionTypes.UPDATE_ALL_DISABLED, Partial<LocalTokensState>>

type ReducerActionType = EnableLocalToken | DisableLocalToken | UpdateAllDisabled

export const enableToken = (payload: TokenAddressPayload): EnableLocalToken => ({
  type: ActionTypes.ENABLE_TOKEN,
  payload,
})
export const disableToken = (payload: TokenAddressPayload): DisableLocalToken => ({
  type: ActionTypes.DISABLE_TOKEN,
  payload,
})
export const updateLocalTokens = (payload: Partial<LocalTokensState>): UpdateAllDisabled => ({
  type: ActionTypes.UPDATE_ALL_DISABLED,
  payload,
})

export const INITIAL_LOCAL_TOKENS_STATE: LocalTokensState = {
  disabled: new Set(),
}

export function reducer(state: LocalTokensState, action: ReducerActionType): LocalTokensState {
  const { disabled } = state

  switch (action.type) {
    case ActionTypes.ENABLE_TOKEN: {
      const { tokenAddress } = action.payload
      // don't update unnecessarily
      if (!disabled.has(tokenAddress)) return state

      const newSet = new Set(disabled)
      newSet.delete(tokenAddress)

      return { ...state, disabled: newSet }
    }

    case ActionTypes.DISABLE_TOKEN: {
      const { tokenAddress } = action.payload
      // don't update unnecessarily
      if (disabled.has(tokenAddress)) return state

      const newSet = new Set(disabled).add(tokenAddress)

      return { ...state, disabled: newSet }
    }

    case ActionTypes.UPDATE_ALL_DISABLED:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
