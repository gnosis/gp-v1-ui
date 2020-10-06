import styled from 'styled-components'

export const TokenRow = styled.tr`
  .enableToken,
  .wrapUnwrapEther {
    height: auto;
    outline: 0;
    margin: 0;
    font-size: 1.2rem;
    color: var(--color-text-active);
    letter-spacing: -0.03rem;
    text-align: center;
    font-family: var(--font-default);
    font-weight: var(--font-weight-bold);
    display: flex;
    align-items: center;
    padding: 0.4rem 1rem;
    box-sizing: border-box;
    background: var(--color-background);
    border: 0.1rem solid var(--color-text-active);
    border-radius: 2rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

    &:hover {
      background-color: var(--color-background-balance-button-hover);
      border-color: var(--color-background-balance-button-hover);
      color: var(--color-text-button-hover);
    }

    > svg {
      margin: 0 0.5rem 0 0;
    }
  }

  .withdrawToken,
  .depositToken {
    outline: 0;
    background: var(--color-text-active);
    border-radius: 2.4rem;
    height: 2.4rem;
    width: 2.4rem;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;

    border: 0.1rem solid var(--color-text-CTA);
    &:hover {
      background-color: var(--color-background-button-hover);
      border-color: var(--color-background-button-hover);
      > svg {
        fill: ghostwhite;
      }
    }
  }

  .withdrawToken {
    background: var(--color-text-active);
    > svg {
      fill: var(--color-svg-withdraw);
    }
  }

  .depositToken {
    background: var(--color-background-banner);
    > svg {
      fill: var(--color-svg-deposit);
    }
  }

  &.loading {
    background-color: #f7f7f7;
    border-bottom-color: #b9b9b9;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;
      align-items: baseline;
      justify-content: flex-end;

      > span {
        margin-right: 0.5rem;
      }
    }

    button.wrapUnwrapEther {
      font-size: 1rem;
      padding: 0.2rem 0.5rem;
      margin: 0.2rem 0;
      display: inline;
      min-width: 5rem;
    }
  }
`

export const RowClaimButton = styled.button`
  margin: 0;
  padding: 0;
  text-align: right;
  font-size: inherit;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;

  &.success {
    color: #63ab52;
    background: transparent;

    &:hover {
      background: transparent;
      color: #63ab52;
    }
  }
  &.disabled {
    color: currentColor;
    cursor: not-allowed;
    opacity: 0.5;
  }

  > div {
    display: flex;
    align-items: inherit;

    > .immatureClaimTooltip {
      color: #d2a827;
      margin-left: 0.5rem;

      > span {
        margin: 0.5rem;
      }
    }
  }
`

export const RowClaimSpan = styled.span`
  font-size: 1.2rem;
  line-height: 1;
  border: 0.1rem solid #63ab52;
  border-radius: 2rem;
  background: transparent;
  color: #63ab52;
  padding: 0.4rem 1rem;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  margin: 0 0 0 0.5rem;

  &:hover {
    background: var(--color-button-success);
    color: white;
  }
`

export const LineSeparator = styled.div`
  border: 0.03125rem solid var(--color-text-primary);
  margin: auto;
  width: calc(100% - 1.5625rem);
`
