import React from 'react'

import OrderBookWidget from 'components/OrderBookWidget'

// Styled components
import { PriceDepthChartWidgetStyled as Wrapper } from './PriceDepthChartWidget.styled'

const demo = {
  baseToken: {
    id: 1,
    label: 'WETH',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    addressMainnet: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    priority: 4,
  },
  quoteToken: {
    id: 2,
    label: 'USDT',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    addressMainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    priority: 1,
  },
  networkId: 1,
}

export const PriceDepthChartWidget: React.FC = () => (
  <Wrapper>
    <OrderBookWidget baseToken={demo.baseToken} quoteToken={demo.quoteToken} networkId={demo.networkId} />
  </Wrapper>
)

export default PriceDepthChartWidget
