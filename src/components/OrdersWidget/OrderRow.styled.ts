import styled from 'styled-components'
import { MEDIA } from 'const'

export const OrderRowWrapper = styled.tr<{ $color?: string; $open?: boolean }>`
  color: ${({ $color = '' }): string => $color};
  min-height: 4rem;

  &.pending {
    background: rgba(33, 141, 255, 0.1);
  }

  &.scheduled {
    background: rgba(0, 201, 167, 0.08);
  }

  .order-image-row {
    display: none;
  }

  .order-details-responsive {
    display: none;
  }

  .order-details {
    white-space: nowrap;

    .order-details-subgrid {
    }
  }

  .sub-columns {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    align-items: center;

    > div:not(:last-child) {
      margin: 0 0.3rem 0 0;
    }
  }

  .pendingCell {
    justify-content: center;
    align-items: center;
    display: flex;

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
