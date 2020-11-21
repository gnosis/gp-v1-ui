import React from 'react'
import styled from 'styled-components'
import Tabs from 'components/common/Tabs/Tabs'

export interface TabItemType {
  title: string
  content?: string | React.ReactNode
  readonly activeColor: string
}

const tabItems: TabItemType[] = [
  {
    title: 'BUY',
    content: '- buy component -',
    activeColor: '--color-buy',
  },
  {
    title: 'SELL',
    content: '- sell component -',
    activeColor: '--color-sell',
  },
]

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  padding: var(--padding-container-default);
`

const OrderBuySell: React.FC = () => (
  <Wrapper>
    <Tabs tabItems={tabItems} />
  </Wrapper>
)

export default OrderBuySell
