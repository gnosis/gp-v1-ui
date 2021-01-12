import React from 'react'
import styled from 'styled-components'
import Tabs, { TabItemType, TabThemeType } from 'components/common/Tabs/Tabs'

const tabItems: TabItemType[] = [
  {
    id: 1,
    title: 'BUY',
    content: '- buy component -',
  },
  {
    id: 2,
    title: 'SELL',
    content: '- sell component -',
  },
]

const tabThemeConfig: TabThemeType = {
  activeBg: '--color-long',
  activeBgAlt: '--color-short',
  inactiveBg: '--color-primary',
  activeText: '--color-primary',
  inactiveText: '--color-primary2',
}

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  padding: var(--padding-container-default);
`

const OrderBuySell: React.FC = () => (
  <Wrapper>
    <Tabs tabItems={tabItems} tabTheme={tabThemeConfig} />
  </Wrapper>
)

export default OrderBuySell
