import { useCallback, useMemo } from 'react'

import { updateTheme } from 'reducers-actions/theme'
import useGlobalState from './useGlobalState'

import { Theme } from 'theme'

export const useThemeMode = (): Theme => {
  const [state] = useGlobalState()

  return useMemo(() => state.theme || Theme.DARK, [state.theme])
}

export function useThemeManager(): [Theme, (newTheme: Theme) => void] {
  const [, dispatch] = useGlobalState()
  const theme = useThemeMode()

  const setNewTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(updateTheme(newTheme))
    },
    [dispatch],
  )

  return [theme, setNewTheme]
}
