import React, { useState } from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { LimitOrder, Props } from './LimitOrder'
import BigNumber from 'bignumber.js'
import { GNO, DAI } from 'storybook/tokens'

export default {
  title: 'Trade/LimitOrder',
  component: LimitOrder,
} as Meta

const defaultProps = {
  sellToken: DAI,
  receiveToken: GNO,
  limitPrice: new BigNumber('55.247234'),
  amount: '100',
}

const Template: Story<Partial<Props>> = (props) => {
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  return (
    <LimitOrder
      isPriceInverted={isPriceInverted}
      onSwapPrices={(): void => {
        console.log('[LimitOrder.story] Swap Prices')
        setIsPriceInverted((inverted) => !inverted)
      }}
      onSelectedPrice={(price): void => console.log('[LimitOrder.story] On selected price', price)}
      onSubmitLimitOrder={(data): void => console.log('[LimitOrder.story] Submit Limit Order', data)}
      {...defaultProps}
      {...props}
    />
  )
}

export const Basic = Template.bind({})
Basic.args = {}

export const NoAmount = Template.bind({})
NoAmount.args = {
  amount: undefined,
}

export const PriceInverted = Template.bind({})
PriceInverted.args = {
  isPriceInverted: true,
}

export const NoTokenSelection = Template.bind({})
NoTokenSelection.args = {
  sellToken: undefined,
  receiveToken: undefined,
}

export const NoSellToken = Template.bind({})
NoSellToken.args = {
  sellToken: undefined,
}

export const NoReceiveToken = Template.bind({})
NoReceiveToken.args = {
  receiveToken: undefined,
}
