import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { MemoryRouter } from 'react-router'

export const RouterDecorator = (DecoratedStory: () => JSX.Element): JSX.Element => (
  <MemoryRouter>{DecoratedStory()}</MemoryRouter>
)
