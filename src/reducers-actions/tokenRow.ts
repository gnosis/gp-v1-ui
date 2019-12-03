export const enum ActionTypes {
  SET_ENABLING = 'enabling',
  SET_CLAIMING = 'claiming',
  SET_HIGHLIGHTED = 'highlighted',
  SET_HIGHLIGHTED_AND_CLAIMING = 'highlighted_and_claiming',
}

interface Actions {
  type: ActionTypes
  payload: string
}

export const setClaimingAction = (payload: string): Actions => ({
  type: ActionTypes.SET_CLAIMING,
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

export interface TokenLocalState {
  enabling: Set<string>
  highlighted: Set<string>
  claiming: Set<string>
}

export const TokenRowInitialState: TokenLocalState = {
  enabling: new Set(),
  highlighted: new Set(),
  claiming: new Set(),
}

export const reducer = (state: TokenLocalState, action: Actions): TokenLocalState => {
  switch (action.type) {
    case ActionTypes.SET_ENABLING:
    case ActionTypes.SET_CLAIMING:
    case ActionTypes.SET_HIGHLIGHTED: {
      const newSet = new Set(state[action.type])
      return {
        ...state,
        [action.type]: newSet.has(action.payload)
          ? newSet.delete(action.payload) && newSet
          : newSet.add(action.payload),
      }
    }
    case ActionTypes.SET_HIGHLIGHTED_AND_CLAIMING: {
      const newClaimingSet = new Set(state.claiming)
      const newHighlightedSet = new Set(state.highlighted)

      if (newClaimingSet.has(action.payload)) {
        newClaimingSet.delete(action.payload)
      } else {
        newClaimingSet.add(action.payload)
      }

      if (newHighlightedSet.has(action.payload)) {
        newHighlightedSet.delete(action.payload)
      } else {
        newHighlightedSet.add(action.payload)
      }

      return {
        ...state,
        claiming: newClaimingSet,
        highlighted: newHighlightedSet,
      }
    }
    default:
      return state
  }
}
