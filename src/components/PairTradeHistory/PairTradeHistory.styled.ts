import styled from 'styled-components'

export const PairTradeHistoryStyled = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-flow: column wrap;
  font-size: var(--font-size-default);
  color: var(--color-text-secondary1);
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  height: 3.6rem;
  align-items: center;
  padding: 0 1rem;
  width: 100%;
  flex-flow: row nowrap;

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

export const History = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 0 1rem;
`

export const Trade = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: var(--font-size-small);
  cursor: pointer;

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
