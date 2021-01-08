import styled from 'styled-components'

export const OrdersWidgetDemo = styled.div`
  height: 100%;
  margin: 0;
  width: 100%;
  grid-area: orders;

  > div > div.tablist {
    background: var(--color-gradient-2);
    justify-content: flex-start;
    align-items: center;
    padding: var(--padding-container-default);
    box-sizing: border-box;
    height: var(--height-bar-small);
  }

  > div > div:last-of-type {
    height: 100%;
    position: relative;
  }

  > div > div.tablist > button {
    flex: 0 1 auto;
    padding: 0.7rem;
    height: auto;
    border-radius: 0.3rem;
    &:not(:last-of-type) {
      margin: 0 1.4rem 0 0;
    }
  }
`
