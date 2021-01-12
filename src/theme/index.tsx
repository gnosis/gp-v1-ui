export * from './styles'
export * from './types'
export * from './utils'

import React, { useMemo } from 'react'
import {
  DefaultTheme,
  isStyledComponent,
  StyledComponent,
  ThemeProvider as StyledComponentsThemeProvider,
} from 'styled-components'

import { getThemePalette } from './utils'
import { useThemeMode } from 'hooks/useThemeManager'

// This type is all React.ReactElement & StyledComponents combined
type ReactOrStyledNode = React.ReactElement &
  StyledComponent<keyof JSX.IntrinsicElements, Record<string, unknown>, Record<string, unknown>, never>

// Extension/override of styled-components' ThemeProvider but with our own constructed theme object
const ThemeProvider: React.FC<{ componentKey?: Partial<DefaultTheme['componentKey']> }> = ({
  children,
  componentKey,
}) => {
  const themeMode = useThemeMode()

  const themeObject = useMemo(() => {
    const themePalette = getThemePalette(themeMode)

    const computedTheme: DefaultTheme = {
      // Compute the app colour pallette using the passed in themeMode
      ...themePalette,
      mode: themeMode,
      // unfold in any extensions
      // for example to make big/small buttons -> see src/components/Button ThemeWrappedButtonBase
      // to see it in action
      componentKey,
    }

    return computedTheme
  }, [themeMode, componentKey])

  // We want to pass the ThemeProvider theme to all children implicitly, no need to manually pass it
  return (
    <StyledComponentsThemeProvider theme={themeObject}>
      {React.Children.map(children, (child: ReactOrStyledNode) =>
        // is not null/undefined/0
        React.isValidElement(child) || isStyledComponent(child)
          ? React.cloneElement(child, {
              theme: themeObject,
            })
          : // if not, don't pass props and just return
            child,
      )}
    </StyledComponentsThemeProvider>
  )
}

export default ThemeProvider
