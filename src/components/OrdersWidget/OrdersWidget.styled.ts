import styled from 'styled-components'
import Widget from 'components/Layout/Widget'
import { RESPONSIVE_SIZES } from 'const'

export const OrdersWrapper = styled(Widget)`
  > a {
    margin-bottom: -2em;
  }
`

export const ButtonWithIcon = styled.button`
  min-width: 10em;

  > svg {
    margin: 0 0.25em;
  }
`

export const CreateButtons = styled.div`
  margin-top: 2em;

  // 💙 grid
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

    margin: 1em 0;

    @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
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

    @media only screen and (max-width: ${RESPONSIVE_SIZES.TABLET}em) {
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
