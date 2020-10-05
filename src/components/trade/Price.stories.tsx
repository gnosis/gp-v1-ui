import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { Price, Props } from './Price'
import { DAI, GNO } from 'storybook/data'
import { FormEmpty } from 'storybook/decorators'

export default {
  title: 'Trade/Price',
  component: Price,
  decorators: [FormEmpty],
} as Meta

const Template: Story<Props> = (props) => <Price {...props} />

const defaultProps = {
  priceInputId: 'price',
  priceInverseInputId: 'inversePrice',
}

export const Basic = Template.bind({})
Basic.args = {
  ...defaultProps,
  quoteToken: GNO,
  baseToken: DAI,
}

// // FIXME: It looks like it allows to use this component with no argument, but then it fails to render
// export const NoArgs = Template.bind({})
