export * from './styles'
export * from './types'
export * from './utils'

import React, { useMemo } from 'react'
import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'

import { getThemePalette } from './utils'
import { useThemeMode } from 'hooks/useThemeManager'

// Extension/override of styled-components' ThemeProvider but with our own constructed theme object
const ThemeProvider: React.FC<{ themeExtension: DefaultTheme['components'] }> = ({ children, themeExtension }) => {
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
      components: themeExtension,
    }

    return computedTheme
  }, [themeMode, themeExtension])

  // We want to pass the ThemeProvider theme to all children implicitly, no need to manually pass it
  return (
    <StyledComponentsThemeProvider theme={themeObject}>
      {React.Children.map(
        children,
        (childWithTheme) =>
          // make sure child is a valid react element as children by default can be type string|null|number
          React.isValidElement(childWithTheme) && React.cloneElement(childWithTheme, { theme: themeObject }),
      )}
    </StyledComponentsThemeProvider>
  )
}

export default ThemeProvider
