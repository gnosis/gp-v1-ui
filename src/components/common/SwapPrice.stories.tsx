import React, { useState } from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { SwapPrice, Props } from './SwapPrice'
import { CenteredAndFramed } from 'storybook/decorators'
import { DAI, GNO, tokenSymbols, findToken } from 'storybook/data'

export default {
  title: 'Common/SwapPrice',
  component: SwapPrice,
  decorators: [CenteredAndFramed],
  argTypes: {
    isPriceInverted: {
      control: null,
    },
    baseTokenSymbol: {
      control: { type: 'select', options: tokenSymbols },
    },
    quoteTokenSymbol: {
      control: { type: 'select', options: tokenSymbols },
    },
    baseToken: {
      control: null,
    },
    quoteToken: {
      control: null,
    },
  },
} as Meta

type SampleProps = Props & {
  baseTokenSymbol: string
  quoteTokenSymbol: string
}

const Template: Story<Partial<SampleProps>> = (props) => {
  const { baseTokenSymbol, quoteTokenSymbol } = props
  const baseToken = findToken(baseTokenSymbol, GNO)
  const quoteToken = findToken(quoteTokenSymbol, DAI)
  const [isPriceInverted, setIsPriceInverted] = useState(false)

  return (
    <SwapPrice
      baseToken={baseToken}
      quoteToken={quoteToken}
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
