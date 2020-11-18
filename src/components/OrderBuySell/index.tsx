import React from 'react'
import styled from 'styled-components'
import Tabs from 'components/common/Tabs/Tabs'

export interface TabItemType {
  readonly id: number
  title: string
  content: string
  readonly activeColor?: string
}

const tabItems: TabItemType[] = [
  {
    id: 1,
    title: 'BUY',
    content: '- buy component -',
    activeColor: '--color-buy',
  },
  {
    id: 2,
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
