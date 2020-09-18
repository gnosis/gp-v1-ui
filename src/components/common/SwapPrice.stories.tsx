import React, { useState } from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { SwapPrice, Props } from './SwapPrice'
import { GNO, DAI } from 'storybook/tokens'
import { CenteredAndFramed } from 'storybook/decorators'

export default {
  title: 'Common/SwapPrice',
  component: SwapPrice,
  decorators: [CenteredAndFramed],
} as Meta

const Template: Story<Partial<Props>> = (props) => {
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  return (
    <SwapPrice
      baseToken={GNO}
      quoteToken={DAI}
      isPriceInverted={isPriceInverted}
      onSwapPrices={(): void => {
        console.log('[LimitOrder.story] Swap Prices')
        setIsPriceInverted((inverted) => !inverted)
      }}
      {...props}
    />
  )
}

export const Default = Template.bind({})

export const ShowBaseToken = Template.bind({})
ShowBaseToken.args = {
  showBaseToken: true,
}
