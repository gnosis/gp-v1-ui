import styled from 'styled-components'

export const ModalBodyWrapper = styled.div`
  div > p {
    padding: 0 1em;
    color: #828282;
    font-size: 0.85em;
  }
`

export const TokenRow = styled.tr`
  // Each cell wrapper (td)
  // > * {
  //   margin: 0.1rem;
  //   padding: 0.7rem;
  //   text-align: center;
  //   transition: all 0.5s ease;

  //   > button {
  //     margin: 0.2rem;
  //   }

  //   &:first-child {
  //     display: grid;
  //     grid-template-columns: min-content max-content;
  //     grid-gap: 1em;
  //     align-items: center;

  //     > * {
  //       margin: 0.375rem;
  //     }

  //     > div:last-child {
  //       text-align: initial;
  //     }
  //   }

  //   &:last-child {
  //     display: flex;
  //     flex-flow: column;
  //   }
  // }

  .enableToken {
    height: auto;
    outline: 0;
    margin: 0;
    font-size: 1.2rem;
    color: #218dff;
    letter-spacing: -0.03rem;
    text-align: center;
    font-family: var(--font-default);
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    padding: 0.4rem 1rem;
    box-sizing: border-box;
    background: #deeeff;
    border: 0.1rem solid #218dff;
    border-radius: 2rem;
    cursor: pointer;
    transition: background 0.2s ease-in-out, color 0.2s ease-in-out;

    > svg {
      margin: 0 0.5rem 0 0;
    }

    &:hover {
      background: #218dff;
      color: #ffffff;
    }
  }

  .withdrawToken,
  .depositToken {
    outline: 0;
    background: #218dff;
    border-radius: 2.4rem;
    height: 2.4rem;
    width: 2.4rem;
    margin: 0 0 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
  }

  .withdrawToken {
    background: #218dff;
  }

  .depositToken {
    background: #dfe6ef;
  }

  &.loading {
    background-color: #f7f7f7;
    border-bottom-color: #b9b9b9;
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
