import styled from 'styled-components'
import { MEDIA } from 'const'

export const OrdersWrapper = styled.div`
  width: 100%;

  > div {
    width: 100%;
  }

  > a {
    margin-bottom: -2em;
  }
`

export const ButtonWithIcon = styled.button`
  min-width: 10rem;
  width: 100%;

  > svg {
    margin: 0 0.25rem;
  }
`

export const CreateButtons = styled.div`
  margin: 2rem 0 0;
  display: grid;

  &.withOrders {
    justify-items: start;
    grid-gap: 0.25em 0.75em;
    grid:
      'tradeBtn strategyBtn'
      '.        strategyInfo'
      / 1fr 1fr;

    .tradeBtn {
      justify-self: end;
    }
  }

  &.withoutOrders {
    // adjust grid layout when no orders
    place-items: center;
    grid-row-gap: 1em;
    grid:
      'noOrdersInfo'
      'tradeBtn'
      'strategyBtn'
      'strategyInfo';

    button {
      // make buttons the same width
      width: 15em;
    }
  }

  .noOrdersInfo {
    grid-area: noOrdersInfo;
  }
  .tradeBtn {
    grid-area: tradeBtn;
  }
  .strategyBtn {
    grid-area: strategyBtn;
  }
  .strategyInfo {
    grid-area: strategyInfo;
  }

  button {
    // resetting button margins to help with alignment
    margin: 0;
  }
`

export const OrdersForm = styled.div`
  .infoContainer {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: center;
    margin: 1rem 0;

    @media ${MEDIA.tablet} {
      grid-template-columns: 2fr 1fr;
    }

    .warning {
      justify-self: end;
    }

    .countContainer {
      display: grid;
      grid: 'total active expired';
      align-items: center;
    }

    .total {
      grid-area: total;
    }
    .active {
      grid-area: active;
    }
    .expired {
      grid-area: expired;
    }
  }

  .ordersContainer {
    display: grid;
  }

  .checked {
    display: flex;
    justify-content: left;
    align-items: center;

    > input {
      width: auto;
    }
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    align-items: center;

    .hidden {
      visibility: hidden;
    }

    @media ${MEDIA.tablet} {
      display: none;
    }
  }

  .noOrders {
    padding: 3em;

    display: flex;
    justify-content: center;
  }

  .warning {
    color: orange;
  }
`
