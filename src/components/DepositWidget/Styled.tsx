import styled from 'styled-components'
import { RESPONSIVE_SIZES } from 'const'

const { TABLET } = RESPONSIVE_SIZES
export const InnerWrapper = styled.div`
  position: relative;
  background-color: var(--color-background-selected-dark);
  border-bottom: 0.125rem solid #0000000f;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-top: -0.52rem;
  width: 80%;

  @media only screen and (max-width: ${TABLET}em) {
    width: 95%;
  }

  > div {
    margin-top: 2rem;
  }

  span.symbol {
    color: #b02ace;
  }

  h4 {
    margin: 2.5rem 1rem 1rem;
    font-size: 1.3em;
    font-weight: normal;
    text-align: center;
  }

  .WalletItemContainer {
    display: grid;
    grid-template-rows: repeat(2, auto) 1.25rem auto;
    justify-content: stretch;
    align-items: center;

    font-weight: bolder;

    margin: auto;
    padding: 0.375rem;
    width: 80%;

    @media only screen and (max-width: ${TABLET}em) {
      width: 95%;
    }

    p.error {
      color: red;
      padding: 0 0.5rem 0.5rem;
      margin: auto;
    }

    div.wallet {
      position: relative;
      display: grid;
      grid-template-columns: minmax(6.3125rem, 7.25rem) minmax(1.5625rem, 0.3fr) minmax(3.375rem, 0.6fr) 4.0625rem;

      justify-content: center;
      align-items: center;
      text-align: center;

      &:last-child {
        margin: auto;
        width: 80%;
        text-align: center;
      }
      > p {
        text-align: right;
      }
      > input {
        margin: 0;
        width: 100%;
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
  }

  .times {
    position: absolute;
    display: inline-block;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0 0.5em 0 0;
    font-size: 2em;
    text-decoration: none;
  }
`

export const DynamicWrapper = styled.div<{ responsive: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  ${(props): string | false =>
    props.responsive &&
    `
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: #000000b5;
      z-index: 99;

      > ${InnerWrapper} {
        border-radius: var(--border-radius);
      }
  `}
`

export const DepositWidgetWrapper = styled.section`
  .gridContainer {
    display: grid;
    width: 100%;
  }

  .headerContainer {
    display: inherit;
    justify-content: center;
    align-items: center;
    grid-template-columns: var(--grid-row-size-walletPage);

    > div {
      color: #000000;
      line-height: 1.5;
      font-size: 0.8em;
      text-transform: uppercase;
      overflow-wrap: break-word;
      padding: 0.5em;
      font-weight: bolder;
    }

    @media only screen and (max-width: ${TABLET}em) {
      display: none;
    }
  }

  .rowContainer {
    display: inherit;
    grid-template-rows: auto;
  }

  .row {
    text-align: center;
    transition: all 0.5s ease;
  }
`

export const ModalBodyWrapper = styled.div`
  div > p {
    padding: 0 1em;
    color: #828282;
    font-size: 0.85em;
  }
`

export const RowTokenDiv = styled.div`
  display: grid;
  grid-template-columns: var(--grid-row-size-walletPage);
  align-items: center;
  justify-content: center;

  background: var(--color-background-pageWrapper);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin: 0.3rem 0;

  z-index: 1;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: var(--color-background-selected);
  }

  > div {
    margin: 0.1rem;
    padding: 0.7rem;
    text-align: center;
    transition: all 0.5s ease;

    > button {
      margin: 0.2rem;
    }

    &:first-child {
      display: grid;
      grid-template-columns: min-content max-content;
      grid-gap: 1em;
      align-items: center;

      > * {
        margin: 0.375rem;
      }

      > div:last-child {
        text-align: initial;
      }
    }

    &:last-child {
      display: flex;
      flex-flow: column;
    }
  }

  &.highlight {
    background-color: var(--color-background-highlighted);
    border-bottom-color: #fbdf8f;
  }

  &.selected {
    background-color: var(--color-button-disabled);
    color: var(--color-background-pageWrapper);
  }

  &.loading {
    background-color: #f7f7f7;
    border-bottom-color: #b9b9b9;
  }

  @media only screen and (max-width: ${TABLET}em) {
    grid-template-columns: none;
    grid-template-rows: auto;

    align-items: center;
    justify-content: stretch;
    padding: 0 0.7rem;

    &.selected {
      > div {
        border-bottom: 0.0625rem solid #ffffff40;
      }
    }
    > div {
      display: flex;
      flex-flow: row;
      align-items: center;
      border-bottom: 0.0625rem solid #00000024;

      > * {
        margin-left: 0.625rem;
      }
      &:first-child {
        grid-template-columns: 1fr max-content auto;

        > img {
          order: 2;
          margin-right: -0.5rem;
        }
      }
      &:last-child {
        border: none;
        flex-flow: row nowrap;
        padding: 0.7rem 0 0.7rem 0.7rem;

        > button:last-child {
          border-radius: 0 var(--border-radius) var(--border-radius);
        }
      }

      &::before {
        content: attr(data-label);
        margin-right: auto;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.7rem;
      }
    }
  }
`

export const RowClaimButton = styled.button`
  margin-bottom: 0;
`

export const RowClaimLink = styled.a`
  text-decoration: none;

  &.success {
    color: #63ab52;
  }
  &.disabled {
    color: currentColor;
    cursor: not-allowed;
    opacity: 0.5;
  }
`
export const LineSeparator = styled.div`
  border: 0.03125rem solid var(--color-text-primary);
  margin: auto;
  width: calc(100% - 1.5625rem);
`
