export const enum ActionTypes {
  SET_ENABLING = 'enabling',
  SET_CLAIMING = 'claiming',
  SET_DEPOSITING = 'depositing',
  SET_WITHDRAWING = 'withdrawing',
  SET_HIGHLIGHTED = 'highlighted',
  SET_HIGHLIGHTED_AND_CLAIMING = 'highlighted_and_claiming',
  SET_HIGHLIGHTED_AND_DEPOSITING = 'highlighted_and_depositing',
  SET_HIGHLIGHTED_AND_WITHDRAWING = 'highlighted_and_withdrawing',
}

interface Actions {
  type: ActionTypes
  payload: string
}

export const setClaimingAction = (payload: string): Actions => ({
  type: ActionTypes.SET_CLAIMING,
  payload,
})
export const setDepositingAction = (payload: string): Actions => ({
  type: ActionTypes.SET_DEPOSITING,
  payload,
})
export const setWithdrawingAction = (payload: string): Actions => ({
  type: ActionTypes.SET_WITHDRAWING,
  payload,
})

export const setEnablingAction = (payload: string): Actions => ({
  type: ActionTypes.SET_ENABLING,
  payload,
})

export const setHighlightAction = (payload: string): Actions => ({
  type: ActionTypes.SET_HIGHLIGHTED,
  payload,
})

export const setHighlightAndClaimingAction = (payload: string): Actions => ({
  type: ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING,
  payload,
})

export const setHighlightAndDepositing = (payload: string): Actions => ({
  type: ActionTypes.SET_HIGHLIGHTED_AND_DEPOSITING,
  payload,
})

export const setHighlightAndWithdrawing = (payload: string): Actions => ({
  type: ActionTypes.SET_HIGHLIGHTED_AND_WITHDRAWING,
  payload,
})

export interface TokenLocalState {
  [ActionTypes.SET_ENABLING]: Set<string>
  [ActionTypes.SET_HIGHLIGHTED]: Set<string>
  [ActionTypes.SET_CLAIMING]: Set<string>
  [ActionTypes.SET_DEPOSITING]: Set<string>
  [ActionTypes.SET_WITHDRAWING]: Set<string>
}

export const TokenRowInitialState: TokenLocalState = {
  enabling: new Set(),
  highlighted: new Set(),
  claiming: new Set(),
  depositing: new Set(),
  withdrawing: new Set(),
}

function getRemainingType(type: ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING): ActionTypes.SET_CLAIMING
function getRemainingType(type: ActionTypes.SET_HIGHLIGHTED_AND_WITHDRAWING): ActionTypes.SET_WITHDRAWING
function getRemainingType(type: ActionTypes.SET_HIGHLIGHTED_AND_DEPOSITING): ActionTypes.SET_DEPOSITING
function getRemainingType(
  type:
    | ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING
    | ActionTypes.SET_HIGHLIGHTED_AND_WITHDRAWING
    | ActionTypes.SET_HIGHLIGHTED_AND_DEPOSITING,
): ActionTypes.SET_CLAIMING | ActionTypes.SET_WITHDRAWING | ActionTypes.SET_DEPOSITING
function getRemainingType(type: ActionTypes): ActionTypes {
  switch (type) {
    case ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING:
      return ActionTypes.SET_CLAIMING

    case ActionTypes.SET_HIGHLIGHTED_AND_DEPOSITING:
      return ActionTypes.SET_DEPOSITING

    case ActionTypes.SET_HIGHLIGHTED_AND_WITHDRAWING:
      return ActionTypes.SET_WITHDRAWING
  }

  // to appease TS
  throw new Error(`Unexpected ActionTypes -- ${type}`)
}

export const reducer = (state: TokenLocalState, action: Actions): TokenLocalState => {
  const { type, payload } = action
  switch (type) {
    case ActionTypes.SET_ENABLING:
    case ActionTypes.SET_CLAIMING:
    case ActionTypes.SET_DEPOSITING:
    case ActionTypes.SET_WITHDRAWING:
    case ActionTypes.SET_HIGHLIGHTED: {
      const newSet = new Set(state[type])
      return {
        ...state,
        [type]: newSet.has(payload) ? newSet.delete(payload) && newSet : newSet.add(payload),
      }
    }
    case ActionTypes.SET_HIGHLIGHTED_AND_DEPOSITING:
    case ActionTypes.SET_HIGHLIGHTED_AND_WITHDRAWING:
    case ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING: {
      const setWithHighlighted = reducer(state, {
        type: ActionTypes.SET_HIGHLIGHTED,
        payload,
      })

      return reducer(setWithHighlighted, {
        type: getRemainingType(type),
        payload,
      })
    }
    default:
      return state
  }
}
