import styled from 'styled-components'

export const OrderBookStyled = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-flow: column wrap;
  font-size: var(--font-size-default);
  color: var(--color-text-secondary1);
`

export const Header = styled.div`
  background: var(--color-primary);
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  height: var(--height-button-default);
  align-items: center;
  padding: 0 1rem;
  width: 100%;
  flex-flow: row nowrap;
  border-bottom: 0.1rem solid var(--color-border);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary2);
  grid-area: orders-header;

  > span:nth-of-type(1) {
    flex: 1 1 38%;
  }

  > span:nth-of-type(2) {
    flex: 1 1 32%;
    text-align: right;
  }

  > span:nth-of-type(3) {
    flex: 1 1 30%;
    text-align: right;
  }
`

export const Book = styled.div`
  overflow-y: auto;
  height: 100%;
  display: grid;
  grid-template-areas:
    'orders-header'
    'orders-sell'
    'orders-spread'
    'orders-buy';
  grid-template-columns: auto;
  grid-template-rows: repeat(4, max-content);

  &::-webkit-scrollbar {
    display: none;
  }
`

export const Orders = styled.div`
  display: flex;
  flex-flow: column wrap;

  &.sell {
    grid-area: orders-sell;
  }

  &.buy {
    grid-area: orders-buy;
  }
`

export const Order = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-small);
  cursor: pointer;
  padding: 0.25rem 1rem;

  &:hover {
    background-color: var(--color-text-hover);
  }

  > span {
    display: flex;
    justify-content: flex-start;
    color: var(--color-text-weak);
  }

  > span:nth-of-type(1) {
    flex: 1 1 38%;
  }

  > span:nth-of-type(2) {
    flex: 1 1 32%;
    justify-content: flex-end;
  }

  > span:nth-of-type(3) {
    flex: 1 1 30%;
    justify-content: flex-end;
  }

  .sell & {
    > span:first-of-type {
      color: var(--color-short);
    }
  }

  .buy & {
    > span:first-of-type {
      color: var(--color-long);
    }
  }
`

export const Spread = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 0.1rem solid var(--color-border);
  border-bottom: 0.1rem solid var(--color-border);
  padding: 1rem;
  font-size: var(--font-size-larger);
  color: var(--color-text-strong);
  margin: 0.5rem 0;
`
