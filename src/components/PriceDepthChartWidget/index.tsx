import React from 'react'
import styled from 'styled-components'
import Tabs, { TabItemType, TabThemeType } from 'components/common/Tabs/Tabs'

import OrderBookWidget from 'components/OrderBookWidget'
import PriceChart from 'components/PriceChart'

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

const tabItems = (): TabItemType[] => [
  {
    id: 1,
    title: 'Price Chart',
    content: <PriceChart />,
  },
  {
    id: 2,
    title: 'Depth Chart',
    content: <OrderBookWidget baseToken={demo.baseToken} quoteToken={demo.quoteToken} networkId={demo.networkId} />,
  },
]

// Provide a custom tabTheme
const tabThemeConfig: TabThemeType = {
  activeBg: '--color-transparent',
  inactiveBg: '--color-transparent',
  activeText: '--color-text-primary',
  inactiveText: '--color-text-secondary2',
  activeBorder: '--color-text-primary',
  inactiveBorder: '--color-text-secondary2',
  borderRadius: false,
  fontSize: '--font-size-default',
}

const TabsWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 0;

  > div > div.tablist {
    background: var(--color-gradient-2);
    padding: calc(var(--padding-container-default) / 2) var(--padding-container-default)
      var(--padding-container-default);
    justify-content: flex-end;
  }

  > div > div.tablist > button {
    flex: 0 1 auto;
    padding: 0 0.8rem;
    line-height: 2;
    height: auto;
  }

  > div > div:last-of-type {
    height: 100%;
  }
`

export const PriceDepthChartWidget: React.FC = () => (
  <Wrapper>
    <TabsWrapper>
      <Tabs tabItems={tabItems()} tabTheme={tabThemeConfig} />
    </TabsWrapper>
  </Wrapper>
)

export default PriceDepthChartWidget
