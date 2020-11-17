import React from 'react'
import { MemoryRouter } from 'react-router'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Frame } from 'components/common/Frame'
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types'
import { ApolloProvider } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { useForm, FormProvider, UseFormOptions } from 'react-hook-form'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons'

import { ThemeProvider } from 'styled-components'

export const DarkModeThemeToggler = (DecoratedStory: () => JSX.Element): JSX.Element => {
  const [darkMode, setDarkMode] = React.useState(false)
  const theme = {
    mode: darkMode ? 'dark' : 'light',
  }

  const handleDarkMode = (): void => setDarkMode((darkMode) => !darkMode)

  return (
    <>
      <ThemeProvider theme={theme}>
        <Frame style={{ backgroundColor: 'lightgray' }}>{DecoratedStory()}</Frame>
      </ThemeProvider>
      <button onClick={handleDarkMode} style={{ marginLeft: '1rem' }}>
        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} /> {darkMode ? 'Light' : 'Dark'}
      </button>
    </>
  )
}

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
