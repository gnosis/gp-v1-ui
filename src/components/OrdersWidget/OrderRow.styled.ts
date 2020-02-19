import styled from 'styled-components'
import { MEDIA } from 'const'

export const OrderRowWrapper = styled.tr<{ $color?: string; $open?: boolean }>`
  color: ${({ $color = '' }): string => $color};
  min-height: 4rem;

  .order-image-row {
    display: none;
  }

  .checked {
    margin: auto;
    > input {
      margin: auto;
    }
    > button {
      display: none;
      justify-content: center;
      align-items: center;

      margin: 0 0 0 auto;
      > * {
        margin: 0 0.5rem;
      }
    }
  }

  .order-details-responsive {
    display: none;
  }

  .order-details,
  .amounts {
    display: grid;
    grid-template-columns: max-content max-content;
    text-align: left;
    justify-content: space-evenly;

    .order-details-subgrid {
      display: grid;
      grid-template-columns: min-content minmax(5.6rem, max-content);
      grid-gap: 0 0.5rem;
      justify-content: space-between;
    }
  }

  .amounts {
    text-align: right;
    justify-content: right;
  }

  .sub-columns {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;

    div:first-child {
      justify-self: end;
    }

    > *:not(:last-child) {
      margin: 0 0.3rem;
    }
  }

  .pendingCell {
    place-items: center;

    a {
      top: 100%;
      position: absolute;
    }
  }

  @media ${MEDIA.tablet} {
    &.selected {
      > td {
        border-bottom: 0.0625rem solid #ffffff40;
      }
    }

    // All TR row items
    > td {
      // Cancel Order Row - shown as button in responsive
      &:first-child:not(.order-image-row) {
        grid-row-start: 6;

        > img {
          order: 2;
          margin-right: -0.5rem;
        }
      }

      // First row - TokenA <-> TokenB - visible in Responsive
      &.order-image-row {
        display: initial;

        &::before {
          content: none !important;
        }

        > div {
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          max-width: 72%;
          margin: auto;

          > div {
            display: inherit;
            justify-content: inherit;
            align-items: center;
            > * {
              margin: 0 0.3rem;
            }
          }
        }
      }

      // Hide Web view "Order Details" for condensed responsive version
      > .order-details {
        display: none;
      }

      > .order-details-responsive {
        display: flex;
      }

      // Web view checkbox for order cancellation
      &.checked {
        grid-template-columns: 0.5fr 1fr;
        justify-self: stretch;
        width: auto;

        > button {
          display: initial;
        }
        > input {
          margin: auto;
          display: none;
        }
      }

      ${(props): string | false =>
        !props.$open &&
        `
        &:not(:nth-child(2)):not(:nth-child(3)):not(:last-child) {
          display: none;
        }
      `}
    }
  }
`
