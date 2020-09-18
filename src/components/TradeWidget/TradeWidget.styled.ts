import styled from 'styled-components'
import Widget from 'components/layout/SwapLayout/Widget'
import { Wrapper } from 'components/ConnectWalletBanner'
import { OrdersWrapper } from 'components/OrdersWidget/OrdersWidget.styled'
import { WalletDrawerInnerWrapper } from 'components/DepositWidget/Form.styled'

import { MEDIA } from 'const'
import arrow from 'assets/img/arrow.svg'
import { FormMessage } from 'components/common/FormMessage'

export const ConfirmationModalWrapper = styled(WalletDrawerInnerWrapper)`
  padding: 0;

  .intro-text {
    margin: 0 0 1rem 0;
  }

  .message {
    margin: 1rem;
  }
`

export const WrappedWidget = styled(Widget)`
  height: 100%;
  overflow-x: visible;
  min-width: 0;
  margin: 0 auto;
  width: auto;
  flex-flow: row nowrap;
  display: flex;
  background: var(--color-background-pageWrapper);
  border-radius: 0.6rem;
  margin: 0 auto;
  font-size: 1.6rem;
  line-height: 1;

  &.expanded {
    width: calc(50vw + 50rem);

    > form {
      width: 0;
      min-width: 0;
      overflow: hidden;
      flex: none;
      padding: 0;
      opacity: 0;
    }
  }

  @media ${MEDIA.tablet}, ${MEDIA.mobile} {
    flex-flow: column wrap;
    height: auto;
    width: 100%;
  }

  @media ${MEDIA.tablet} {
    min-width: 90vw;
  }
`

export const WrappedForm = styled.form`
  display: flex;
  flex-flow: column nowrap;
  flex: 1 0 42rem;
  max-width: 50rem;
  padding: 1.6rem;
  box-sizing: border-box;
  transition: width 0.2s ease-in-out, opacity 0.2s ease-in-out;
  opacity: 1;

  .react-select__control:focus-within,
  input[type='checkbox']:focus,
  button:focus {
    outline: 1px dotted gray;
  }

  @media ${MEDIA.tablet} {
    max-width: initial;
    flex: 1 1 50%;
    padding: 1.6rem 1.6rem 3.2rem;
  }

  @media ${MEDIA.mobile} {
    width: 100%;
    flex: 1 1 100%;
    max-width: 100%;
  }

  > div {
    @media ${MEDIA.mobile} {
      width: 100%;
    }
  }

  > p {
    font-size: 1.3rem;
    color: var(--color-text-primary);
    letter-spacing: 0;
    text-align: center;
    margin: 1.6rem 0 0;
  }

  ${FormMessage} {
    font-size: 1.3rem;
    line-height: 1.2;
    margin: 0.5rem 0 0;
    flex-flow: row wrap;
    justify-content: flex-start;

    overflow-y: auto;

    @media ${MEDIA.mediumUp} {
      max-height: 11rem;
    }

    > b {
      margin: 0.3rem;
    }

    > i {
      margin: 0;
      font-style: normal;
      width: 100%;

      > strong {
        margin: 0.3rem 0 0.3rem 0.3rem;
        font-size: 1.3rem;
        word-break: break-all;

        > span {
          word-break: break-word;
        }
      }
    }

    > .btn {
      margin: 0.3rem 0;
    }
  }
`
// Switcharoo arrows
export const IconWrapper = styled.a`
  margin: 1rem auto;

  > svg {
    fill: var(--color-svg-switcher);
    transition: opacity 0.2s ease-in-out;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
`

export const WarningLabel = styled(FormMessage)`
  &&&&& {
    color: ghostwhite;
    background: var(--color-button-danger);
    justify-content: center;
    font-weight: bolder;
  }
`

export const SubmitButton = styled.button`
  background-color: var(--color-background-CTA);
  color: var(--color-text-CTA);
  border-radius: 3rem;
  font-family: var(--font-default);
  font-size: 1.6rem;
  letter-spacing: 0.1rem;
  text-align: center;
  text-transform: uppercase;
  padding: 1rem 2rem;
  box-sizing: border-box;
  line-height: 1;
  width: 100%;
  font-weight: var(--font-weight-bold);
  height: 4.6rem;
  margin: 1rem auto 0;
  max-width: 32rem;

  @media ${MEDIA.mobile} {
    font-size: 1.3rem;
    margin: 1rem auto 1.6rem;
  }
`

export const ExpandableOrdersPanel = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: column wrap;
  flex: 1;
  min-width: 50vw;
  max-width: 100%;
  background: var(--color-background) none repeat scroll 0% 0%; // var(--color-background-pageWrapper);
  border-radius: 0 0.6rem 0.6rem 0;
  box-sizing: border-box;
  transition: flex 0.2s ease-in-out;
  align-items: flex-start;
  align-content: flex-start;

  @media ${MEDIA.tablet} {
    flex: 1 1 50%;
    min-width: initial;
    border-radius: 0;
  }

  // Connect Wallet banner in the orders panel
  ${Wrapper} {
    background: transparent;
    box-shadow: none;
  }

  // Orders widget when inside the ExpandableOrdersPanel
  ${OrdersWrapper} {
    width: calc(100% - 1.6rem);
    height: 90%;
    background: transparent;
    box-shadow: none;
    border-radius: 0;

    @media ${MEDIA.desktop} {
      min-width: initial;
    }

    @media ${MEDIA.tablet}, ${MEDIA.mobile} {
      width: 100%;
    }

    // Search Filter
    .widgetFilterTools {
      > .balances-searchTokens {
        height: 3.6rem;
        margin: 0.8rem;
      }
    }

    .widgetCardWrapper {
      thead,
      tbody {
        font-size: 1.1rem;

        > tr {
          padding: 0 1.4rem;

          @media ${MEDIA.mobile} {
            padding: 1.4rem;
          }
        }
      }
    }
  }

  > div.innerWidgetContainer {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-flow: column nowrap;
    border-radius: 0 0.6rem 0.6rem 0;

    > h5 {
      display: flex;
      flex: 0 0 5rem;
      align-items: center;
      justify-content: center;
      height: 10%;
      width: 100%;
      margin: 0;
      padding: 0;

      font-weight: var(--font-weight-bold);
      font-size: 1.6rem;
      color: var(--color-text-primary);
      letter-spacing: 0.03rem;
      text-align: center;

      > a {
        font-size: 1.3rem;
        font-weight: var(--font-weight-normal);
        color: var(--color-text-active);
        text-decoration: underline;
      }
    }

    @media ${MEDIA.tablet} {
      width: 100%;
      border-radius: 0;
      margin: 2.4rem auto 0;
    }

    @media ${MEDIA.mobile} {
      display: none;
    }
  }
`

export const OrdersToggler = styled.button<{ $isOpen?: boolean }>`
  width: 1.6rem;
  height: 100%;
  border-right: 0.1rem solid rgba(159, 180, 201, 0.5);
  background: var(--color-background);
  padding: 0;
  margin: 0;
  outline: 0;

  @media ${MEDIA.tablet}, ${MEDIA.mobile} {
    display: none;
  }

  &::before {
    display: block;
    content: ' ';
    background: url(${arrow}) no-repeat center/contain;
    height: 1.2rem;
    width: 100%;
    margin: 0;
    transform: rotate(${({ $isOpen }): number => ($isOpen ? 0.5 : 0)}turn);
  }

  &:hover {
    background-color: var(--color-background-banner);
  }
`
