import React, { useMemo } from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { ORDER_BOOK_HOPS_DEFAULT, ORDER_BOOK_HOPS_MAX } from 'const'
import OrderBookWidget, { OrderBookProps } from './OrderBookWidget'
import {
  defaultNetworkId,
  defaultBaseToken,
  defaultQuoteToken,
  findTokenBySymbolOrAddress,
  networkMap,
  tokenSymbols,
} from 'storybook/tokenDefaults'

const defaultParams: OrderBookProps = {
  baseToken: defaultBaseToken,
  quoteToken: defaultQuoteToken,
  networkId: defaultNetworkId,
  hops: ORDER_BOOK_HOPS_DEFAULT,
}

// with price-estimation endpoints
const availableNetworks = {
  Mainnet: networkMap.Mainnet,
  Rinkeby: networkMap.Rinkeby,
}

export default {
  title: 'OrderBook/Widget',
  component: OrderBookWidget,
  argTypes: {
    networkId: { control: { type: 'inline-radio', options: availableNetworks } },
    baseToken: { control: { type: 'select', options: tokenSymbols } },
    quoteToken: { control: { type: 'select', options: tokenSymbols } },
    hops: {
      control: {
        type: 'inline-radio',
        // [0, 1, ..., ORDER_BOOK_HOPS_MAX]
        options: Array.from({ length: ORDER_BOOK_HOPS_MAX + 1 }, (_, index) => index),
      },
    },
    batchId: {
      control: {
        type: 'number',
        min: 0,
        step: 1,
      },
    },
  },
  decorators: [(Story): JSX.Element => <div style={{ height: '95vh' }}>{Story()}</div>],
} as Meta

interface TemplateProps extends Omit<OrderBookProps, 'baseToken' | 'quoteToken'> {
  baseToken: string
  quoteToken: string
}

/**
 * initialTokenSelection:
  sellToken: DAI
  receiveToken: USDC
 */
const { sellToken: sellTokenSymbol, receiveToken: receiveTokenSymbol } = CONFIG.initialTokenSelection

const initBaseToken = findTokenBySymbolOrAddress(sellTokenSymbol, defaultBaseToken)
const initQuoteToken = findTokenBySymbolOrAddress(receiveTokenSymbol, defaultQuoteToken)

const Template: Story<TemplateProps> = ({ baseToken: baseTokenSymbol, quoteToken: quoteTokenSymbol, ...args }) => {
  const baseToken = useMemo(() => findTokenBySymbolOrAddress(baseTokenSymbol, initBaseToken), [baseTokenSymbol])

  const quoteToken = useMemo(() => findTokenBySymbolOrAddress(quoteTokenSymbol, initQuoteToken), [quoteTokenSymbol])

  return <OrderBookWidget {...args} baseToken={baseToken} quoteToken={quoteToken} />
}

export const Primary = Template.bind({})
Primary.args = {
  ...defaultParams,
  baseToken: sellTokenSymbol,
  quoteToken: receiveTokenSymbol,
}
