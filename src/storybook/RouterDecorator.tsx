import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { StoryFnReactReturnType } from '@storybook/react/dist/client/preview/types'
import { MemoryRouter } from 'react-router'

export const RouterDecorator = (DecoratedStory: () => StoryFnReactReturnType): JSX.Element => (
  <MemoryRouter initialEntries={['/']}>{DecoratedStory()}</MemoryRouter>
)
