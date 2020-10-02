import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Frame } from 'components/common/Frame'
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types'
import { ApolloProvider } from '@apollo/client'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { useForm, FormProvider } from 'react-hook-form'

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

export const Form = (DecoratedStory: () => StoryFnReactReturnType): JSX.Element => {
  const methods = useForm()
  return (
    <Frame style={{ maxWidth: '50rem' }}>
      <FormProvider {...methods}>
        <form>{DecoratedStory()}</form>
      </FormProvider>
    </Frame>
  )
}
