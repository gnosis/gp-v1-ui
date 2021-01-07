import { Actions } from 'reducers-actions'
import { Theme } from 'theme'
import { setStorageItem } from 'utils'

export interface UserState {
  theme: Theme
}

type ActionTypes = 'UPDATE_USER_STATE' | 'UPDATE_THEME'

type UpdateThemeAction = Actions<ActionTypes, Pick<UserState, 'theme'>>

export const updateTheme = (payload: Pick<UserState, 'theme'>): UpdateThemeAction => ({
  type: 'UPDATE_THEME',
  payload,
})

export const INITIAL_USER_STATE: UserState = {
  theme: Theme.AUTO,
}

export function reducer(state: UserState, action: UpdateThemeAction): UserState {
  const { type, payload } = action
  switch (type) {
    case 'UPDATE_THEME':
      return { ...state, theme: payload.theme }

    default:
      return state
  }
}

// ******** SIDE EFFECT
const USER_LOCAL_STORAGE_KEY = 'USER_PER_ACCOUNT'

export async function sideEffect(state: UserState, action: UpdateThemeAction): Promise<void> {
  switch (action.type) {
    case 'UPDATE_THEME':
      setStorageItem(USER_LOCAL_STORAGE_KEY, state)
  }
}
