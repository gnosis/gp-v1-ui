import styled from 'styled-components'
import { MEDIA } from 'const'
import { CardWidgetWrapper } from 'components/layout/SwapLayout/Card'
import { StandaloneCardWrapper } from 'components/layout'

// OrdersWidget outside wrapper
export const OrdersWrapper = styled(StandaloneCardWrapper)`
  height: 100%;
  width: 100%;

  > h5 {
    width: 100%;
    margin: 0 auto;
    padding: 1.6rem 0 1rem;
    font-weight: var(--font-weight-bold);
    font-size: 1.6rem;
    color: var(--color-text-primary);
    letter-spacing: 0.03rem;
    text-align: center;
  }

  > div {
    height: 100%;
    width: 100%;
    position: relative;
    display: flex;
    flex-flow: column wrap;
    flex: 1 1 auto;
    min-width: initial;
  }

  > a {
    margin-bottom: -2em;
  }

  .noOrdersInfo {
    text-align: center;
    line-height: 1.4;
  }

  ${CardWidgetWrapper} {
    > table {
      > tbody {
        > tr.orderRowWrapper {
          @media ${MEDIA.mobile} {
            display: flex;
            padding-right: 4.3rem;

            > td.checked {
              position: absolute;
              right: 0;
              height: calc(100% - 2.8rem);
              width: 3.3rem;
              padding: 0;

              border: none;
              border-left: 0.2rem solid rgba(0, 0, 0, 0.075);

              &::before {
                display: none;
              }

              > input[type='checkbox'] {
                margin: auto;
              }
            }
          }
        }
      }
    }
  }
`

export const ButtonWithIcon = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6rem;
  border: 0.1rem solid var(--color-text-deleteOrders);
  transition: background 0.2s ease-in-out, color 0.2s ease-in-out;
  background: transparent;
  color: var(--color-text-deleteOrders);
  outline: 0;

  &:hover {
    background: var(--color-text-deleteOrders);
    color: var(--color-background-pageWrapper);
  }

  > svg {
    margin: 0 0.25rem;
  }
`

export const OrdersForm = styled.div`
  > form {
    display: flex;
    flex-flow: column nowrap;
    height: 100%;

    @media ${MEDIA.tablet} {
      height: inherit;
    }
    @media ${MEDIA.mobile} {
      height: inherit;
    }
  }

  .widgetFilterTools {
    #filterLabel {
      bottom: -1.2rem;
      border-radius: 0 0 1.6rem 0rem;
    }

    > label.checked {
      display: none;
      justify-content: center;
      margin: auto 1rem;
      white-space: nowrap;

      > small {
        margin-right: 1rem;
      }
    }

    @media ${MEDIA.mobile} {
      > .balances-searchTokens {
        margin: 0.8rem;
      }

      > label.checked {
        display: flex;
      }
    }
  }

  .infoContainer {
    margin: 0 auto;
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
    justify-content: center;
    border-bottom: 0.1rem solid var(--color-text-secondary);
    align-items: center;

    @media ${MEDIA.mobile} {
      margin: 0 auto;
    }

    .countContainer {
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      margin: 0 0 -0.1rem;
      align-items: center;

      > button {
        font-weight: var(--font-weight-bold);
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        letter-spacing: 0;
        text-align: center;
        background: transparent;
        flex: 1;
        height: 100%;
        outline: 0;
        text-transform: uppercase;
        display: flex;
        flex: 1 1 25%;
        width: 100%;
        justify-content: center;
        transition: border 0.2s ease-in-out;
        align-items: center;
        border-bottom: 0.3rem solid transparent;
        min-height: 6.4rem;

        > i {
          height: 1.8rem;
          font-weight: inherit;
          font-size: 1.1rem;
          color: var(--color-background-pageWrapper);
          letter-spacing: -0.046rem;
          text-align: center;
          background: var(--color-text-secondary);
          border-radius: 6rem;
          padding: 0 0.75rem;
          box-sizing: border-box;
          line-height: 1.8rem;
          font-style: normal;
          display: inline-block;
          height: 1.8rem;
          margin: 0 0 0 0.5rem;
        }

        @media ${MEDIA.mobile} {
          flex: 1;
          font-size: 1.2rem;
          min-height: 5.4rem;

          > i {
            font-size: 0.9rem;
            height: 1.3rem;
            line-height: 1.36rem;
          }
        }

        @media ${MEDIA.xSmallDown} {
          flex-flow: column nowrap;

          > i {
            margin: 0.3rem auto;
          }
        }
      }

      > button.selected {
        border-bottom: 0.3rem solid var(--color-text-active);
        color: var(--color-text-active);
      }

      > button.selected > i {
        background: var(--color-text-active);
      }
    }
  }

  .ordersContainer {
    display: grid;
    box-sizing: border-box;
    overflow-y: auto;

    @media ${MEDIA.tablet} {
      overflow-y: none;
    }
  }

  .checked {
    display: flex;
    justify-content: left;
    align-items: center;
  }

  .deleteContainer {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 4rem;
    z-index: 2;
    justify-content: flex-start;
    align-items: center;
    background: var(--color-background-deleteOrders);
    color: var(--color-text-deleteOrders);
    text-align: left;
    padding: 0.8rem 1.1rem;
    opacity: 1;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    transition: height 0.2s ease-in-out, opacity 0.2s ease-in-out;
    outline: 0;
    flex-flow: row nowrap;

    &[data-disabled='true'] {
      height: 0;
      overflow: hidden;
      padding: 0 0.9rem;
      opacity: 0;
    }

    > b {
      margin: 0 1rem 0 0;
      font-weight: var(--font-weight-bold);
      font-family: initial;
    }
  }

  .noOrders {
    padding: 3em;
    display: flex;
    justify-content: center;

    @media ${MEDIA.mobile} {
      font-size: 1.4rem;
      min-height: 20rem;
    }
  }

  .warning {
    color: orange;
  }
`
