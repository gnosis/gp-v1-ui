import React, { useMemo } from 'react'
import { MemoryRouter } from 'react-router'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Frame } from 'components/common/Frame'
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types'
import { ApolloProvider } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { useForm, FormProvider, UseFormOptions } from 'react-hook-form'
import { getThemePalette, StaticGlobalStyle, Theme } from 'theme'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faLightbulb } from '@fortawesome/free-regular-svg-icons'

import { ThemeToggle } from 'components/common/Button'
import { useThemeManager } from 'hooks/useThemeManager'

import { withGlobalContext } from 'hooks/useGlobalState'
import { INITIAL_STATE, rootReducer } from 'reducers-actions'

export const GlobalStyles = (DecoratedStory: () => StoryFnReactReturnType): JSX.Element => (
  <>
    <StaticGlobalStyle />
    {DecoratedStory()}
  </>
)

const ThemeTogglerUnwrapped: React.FC = ({ children }) => {
  const [themeMode, setThemeMode] = useThemeManager()
  const [themePalette, isDarkMode] = useMemo(() => [getThemePalette(themeMode), themeMode === Theme.DARK], [themeMode])

  const handleDarkMode = (): void => setThemeMode(themeMode === Theme.DARK ? Theme.LIGHT : Theme.DARK)

  return (
    <>
      <Frame style={{ background: themePalette.bg1 }}>{children}</Frame>
      {/* Cheeky use of ButtonBase here :P */}
      <ThemeToggle onClick={handleDarkMode} mode={isDarkMode}>
        <FontAwesomeIcon icon={isDarkMode ? faMoon : faLightbulb} />
      </ThemeToggle>
      <br />
      <br />
      <code>Current theme: {themeMode.toUpperCase()}</code>
    </>
  )
}
const WrappedThemeToggler: React.FC = withGlobalContext(ThemeTogglerUnwrapped, INITIAL_STATE, rootReducer)

// Redux aware ThemeToggler - necessary for Theme
export const ThemeToggler = (DecoratedStory: () => JSX.Element): JSX.Element => (
  <WrappedThemeToggler>{DecoratedStory()}</WrappedThemeToggler>
)

export const Router = (DecoratedStory: () => JSX.Element): JSX.Element => (
  <MemoryRouter>{DecoratedStory()}</MemoryRouter>
)

export const CenteredAndFramed = (DecoratedStory: () => StoryFnReactReturnType): JSX.Element => (
  <div style={{ textAlign: 'center' }}>
    <Frame style={{ display: 'inline-block' }}>{DecoratedStory()}</Frame>
  </div>
)

const apolloClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/gnosis/protocol',
  cache: new InMemoryCache(),
})

export const Apollo = (DecoratedStory: () => StoryFnReactReturnType): JSX.Element => (
  <ApolloProvider client={apolloClient}>
    <Frame style={{ display: 'inline-block' }}>{DecoratedStory()}</Frame>
  </ApolloProvider>
)

export const Form = (args?: UseFormOptions) =>
  function InnerForm(DecoratedStory: () => StoryFnReactReturnType): JSX.Element {
    const methods = useForm(args)
    return (
      <Frame>
        <FormProvider {...methods}>
          <form>{DecoratedStory()}</form>
        </FormProvider>
      </Frame>
    )
  }

export const FormEmpty = Form()
