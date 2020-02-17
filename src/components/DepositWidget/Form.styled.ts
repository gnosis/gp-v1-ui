import styled from 'styled-components'

export const WalletDrawerInnerWrapper = styled.div`
  display: grid;
  grid-template-rows: repeat(2, auto) 1.25rem auto;
  justify-content: stretch;
  align-items: center;

  font-weight: bolder;

  margin: auto;
  padding: 0.375rem;
  width: 80%;

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
      background-color: #fff;
      color: #000;
      margin: 0;
      width: 100%;

      &:disabled {
        /* background-color: var(--color-text-secondary); */
        opacity: 0.5;
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
