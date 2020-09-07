import { Actions, ActionCreator, ReducerCreator } from 'reducers-actions'
import { DEFAULT_SUGGESTED_SLIPPAGE } from 'const'

const ActionsList = ['SET_PRICE_SLIPPAGE'] as const

type PriceSlippageActions = typeof ActionsList[number]
type PriceSlippagePayload = string

type PriceSlippageState = PriceSlippagePayload

const setPriceSlippage: ActionCreator<PriceSlippageActions, PriceSlippagePayload> = (payload) => ({
  type: ActionsList[0],
  payload,
})

const PRICE_SLIPPAGE_INITIAL_STATE = DEFAULT_SUGGESTED_SLIPPAGE

const reducer: ReducerCreator<PriceSlippageState, Actions<PriceSlippageActions, PriceSlippagePayload>> = (
  state,
  action,
) => {
  switch (action.type) {
    case ActionsList[0]:
      return action.payload
    default:
      return state
  }
}

export { setPriceSlippage, reducer, PriceSlippageState, PRICE_SLIPPAGE_INITIAL_STATE }
