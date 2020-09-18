
import React from 'react'
import GlobalStyles from 'styles/global'
import { BaseDecorators } from '@storybook/addons'

export const parameters = {
}

export const decorators: BaseDecorators<JSX.Element> = [
  (Story) => (
    <>
      <GlobalStyles />
      {/* TODO: change to <Story/> when https://github.com/storybookjs/storybook/issues/12255 is fixed */}
      {Story()}
    </>
  ),
];