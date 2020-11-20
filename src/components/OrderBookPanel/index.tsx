import React from 'react'
import styled from 'styled-components'

// export interface TabItemType {
//   readonly id: number
//   title: string
//   content: string
//   readonly activeColor?: string
// }

// const tabItems: TabItemType[] = [
//   {
//     id: 1,
//     title: 'BUY',
//     content: '- buy component -',
//     activeColor: '--color-buy',
//   },
//   {
//     id: 2,
//     title: 'SELL',
//     content: '- sell component -',
//     activeColor: '--color-sell',
//   },
// ]

const Wrapper = styled.div`
  display: flex;
  padding: var(--padding-container-default);
  background: none;
  width: 31rem;
  flex-flow: column wrap;
  position: relative;
  height: 100%;
  border-right: 0.1rem solid var(--color-border);
`

export const OrderBookPanel: React.FC = () => (
  <Wrapper>
    <p>Order Book Panel</p>
    {/* <Tabs tabItems={tabItems} /> */}
  </Wrapper>
)
