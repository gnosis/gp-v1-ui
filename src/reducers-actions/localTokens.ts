import { Actions } from 'reducers-actions'
import { STORAGE_KEY_DISABLED_TOKENS_ADDRESSES } from 'const'

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
export const saveDisabledToStorage = ({ disabled }: LocalTokensState): void => {
  const disabledAddressesArray = Array.from(disabled)
  localStorage.setItem(STORAGE_KEY_DISABLED_TOKENS_ADDRESSES, JSON.stringify(disabledAddressesArray))
}

const initializeDisabled = (): Set<string> => {
  const disabledTokensFromStorage = localStorage.getItem(STORAGE_KEY_DISABLED_TOKENS_ADDRESSES)
  const initialDisabledSet = disabledTokensFromStorage
    ? new Set<string>(JSON.parse(disabledTokensFromStorage))
    : new Set<string>()

  return initialDisabledSet
}

export const INITIAL_LOCAL_TOKENS_STATE: LocalTokensState = {
  disabled: initializeDisabled(),
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

export function sideEffect(state: LocalTokensState, action: ReducerActionType): void {
  switch (action.type) {
    case ActionTypes.ENABLE_TOKEN:
    case ActionTypes.DISABLE_TOKEN:
    case ActionTypes.UPDATE_ALL_DISABLED:
      saveDisabledToStorage(state)
  }
}
