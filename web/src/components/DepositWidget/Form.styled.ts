import styled from 'styled-components'
import { MEDIA } from 'const'

export const WalletDrawerInnerWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column wrap;
  margin: 0;
  padding: 2.4rem 0;
  box-sizing: border-box;

  .message {
    color: var(--color-text-primary);
    background: var(--color-background-validation-warning);
    border-radius: 0 0 0.3rem 0.3rem;
    padding: 1rem;
    font-size: 1.3rem;
    margin: -1rem 1.6rem 1.6rem;
    font-family: var(--font-default);
    letter-spacing: 0;
    line-height: 1.4;
  }

  p.error {
    color: var(--color-error);
    text-align: left;
    margin: 1rem 0 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 0 0 7.6rem;

    @media ${MEDIA.mobile} {
      padding: 0;
    }
  }

  div.wallet {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 0 0 2.4rem;
    padding: 0 2.4rem;
    flex-flow: row wrap;
    box-sizing: border-box;
    width: 100%;

    @media ${MEDIA.mobile} {
      padding: 0 1.6rem;
    }

    > span {
      margin: 0.8rem 0 1.6rem;
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      flex-flow: row wrap;

      > b {
        margin: 0 0.5rem 0 0;
      }
      > p {
        font-size: 1.3rem;
        color: var(--color-text-active);
        padding: 0.5rem 0 0;
        text-align: right;
        margin: 0;
        width: 100%;
        cursor: pointer;
        text-decoration: underline;
      }
    }

    > b {
      font-family: var(--font-default);
      font-size: 1.3rem;
      color: var(--color-text-primary);
      letter-spacing: 0;
      text-align: right;
      padding: 0;
      margin: 0 1.6rem 0 0;
      width: 6rem;
      flex: none;

      @media ${MEDIA.mobile} {
        width: 100%;
        padding: 0 0 1rem;
        text-align: left;
        margin: 0;
      }
    }

    > div {
      width: auto;
      flex: 1 1 auto;
      position: relative;
    }

    > div > i {
      position: absolute;
      right: 1rem;
      top: 0;
      bottom: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      font-style: normal;
      font-family: var(--font-default);
      color: var(--color-text-primary);
      letter-spacing: -0.05rem;
      text-align: right;
      font-weight: var(--font-weight-bold);
      font-size: 1.2rem;
    }

    > div > input {
      margin: 0;
      max-width: 100%;
      background: var(--color-background-input);
      border-radius: 0.6rem 0.6rem 0 0;
      border: 0;
      font-size: 1.6rem;
      line-height: 1;
      box-sizing: border-box;
      border-bottom: 0.2rem solid transparent;
      font-weight: var(--font-weight-normal);
      padding: 0 6rem 0 1rem;
      outline: none;
      height: 5.6rem;
      width: 100%;
      font-family: var(--font-mono);
      font-size: 1.6rem;
      color: var(--color-text-primary);
      letter-spacing: -0.08rem;

      &::placeholder {
        color: inherit;
        font-size: inherit;
      }

      &:focus {
        border-bottom: 0.2rem solid var(--color-text-active);
        border-color: var(--color-text-active);
        color: var(--color-text-active);
      }

      &.error {
        border-color: var(--color-error);
      }

      &.warning {
        color: #ff5722;
      }

      &:disabled {
        opacity: 1;
        background: var(--color-background-pageWrapper);
      }
    }
  }

  .actions {
    margin: auto;
    height: 5.6rem;
    border-top: 0.1rem solid var(--color-background-banner);
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0 1.6rem;
    box-sizing: border-box;

    @media ${MEDIA.mobile} {
      position: relative;
      top: initial;
      bottom: initial;
      left: initial;
    }

    > button,
    > a {
      margin: 0;
      border-radius: 0.6rem;
      outline: 0;
      height: 3.6rem;
      box-sizing: border-box;
      letter-spacing: 0.03rem;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      text-transform: uppercase;
    }

    > a {
      font-size: 1.4rem;
      font-weight: var(--font-weight-bold);
    }

    > button {
      border-radius: 0.6rem;
      min-width: 14rem;
      padding: 0 1.6rem;
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      font-size: 1.4rem;
      margin: 0;

      @media ${MEDIA.mobile} {
        margin: 1.6rem 0 1.6rem 1.6rem;
        font-size: 1.3rem;
        padding: 0 1rem;
      }

      > img,
      > svg {
        margin: 0 0 0 0.8rem;
      }
    }
  }

  .buttons {
    text-align: center;
    padding-top: 1em;
    button {
      min-width: 7em;
      margin-left: 1.2em;
    }
  }
`
