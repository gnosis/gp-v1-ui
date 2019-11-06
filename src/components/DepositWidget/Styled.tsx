import styled from 'styled-components'

export const DynamicWrapper = styled.div<{ responsive: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  ${(props): string =>
    props.responsive &&
    `
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: #000000b5;
    `}
`

export const InnerWrapper = styled.div`
  position: relative;
  background-color: #f7f0ff;
  border-bottom: 2px solid #0000000f;
  border-radius: 20px;
  width: 96%;

  > div {
    margin-top: 2rem;
  }

  span.symbol {
    color: #b02ace;
  }

  h4 {
    margin: 3rem 1rem 1rem;
    font-size: 1.3em;
    text-align: center;
  }

  ul {
    align-items: center;
    list-style: none;
    text-align: left;
    margin: auto;
    padding: 1rem 0 1rem 3rem;
    max-width: 364px;

    @media only screen and (max-width: 420px) {
      padding: 1rem 0;
    }

    li {
      display: block;
      margin: 0 auto;
    }

    li > label {
      width: 9em;
      color: #6c0084;
      font-weight: bold;
      text-align: right;
    }

    p.error {
      color: red;
      padding: 0 0 0.5em 10em;
      margin: 0;
    }

    div.wallet {
      display: inline-block;
      text-align: center;
      position: relative;

      a.max {
        display: inline-block;
        margin-left: 0.5em;
        position: absolute;
        top: 1.3em;
        right: -3em;
      }
    }

    li > label {
      display: block;
      height: 100%;
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
    top: 0;
    right: 0;
    text-decoration: none;
    font-size: 2em;
    display: inline-block;
    padding: 0 0.5em 0 0;
  }
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
    grid-template-columns: 1.1fr repeat(4, 1fr);

    > div {
      color: #000000;
      line-height: 1.5;
      font-size: 0.8em;
      text-transform: uppercase;
      overflow-wrap: break-word;
      padding: 0.5em;
      font-weight: 800;
    }

    @media only screen and (max-width: 500px) {
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
  grid-template-columns: 1.1fr repeat(4, 1fr);
  align-items: center;
  justify-content: center;

  border-bottom: 2px solid #0000000f;
  border-radius: 20px;
  margin: 0.3rem 0;

  transition: background 0.1s ease-in-out;

  &:hover {
    background: #0000000a !important;
  }

  > div {
    margin: 0.1rem;
    padding: 0.7rem;
    text-align: center;
    transition: all 0.5s ease;

    &:first-child {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-evenly;
      align-items: center;
      > * {
        margin: 5px;
      }
    }

    &:last-child {
      display: flex;
      flex-flow: column;
    }
  }

  &.highlight {
    background-color: #fdffc1;
    border-bottom-color: #fbdf8f;
  }

  &.loading {
    background-color: #f7f7f7;
    border-bottom-color: #b9b9b9;
  }

  &.selected {
    background-color: #ecdcff;
  }

  @media only screen and (max-width: 500px) {
    grid-template-columns: none;
    grid-template-rows: auto;

    align-items: center;
    justify-content: stretch;
    padding: 0 0.7rem;

    box-shadow: 1px 6px 7px 0px #0000002e;

    > div {
      display: flex;
      flex-flow: row;
      align-items: center;
      border-bottom: 1px solid #00000024;

      > * {
        margin-left: 10px;
      }
      &:first-child {
        > img {
          order: 2;
          margin-right: -8px;
        }
      }
      &:last-child {
        border: none;
        flex-flow: row nowrap;
        padding: 0.7rem 0 0.7rem 0.7rem;

        > button {
          margin: 0.2rem;
        }

        > button:last-child {
          border-radius: 0 20px 20px;
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
