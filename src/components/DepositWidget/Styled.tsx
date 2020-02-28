import styled from 'styled-components'

export const ModalBodyWrapper = styled.div`
  div > p {
    font-size: inherit;
    color: inherit;
    padding: 0;
  }
`

export const TokenRow = styled.tr`
  .enableToken {
    height: auto;
    outline: 0;
    margin: 0;
    font-size: 1.2rem;
    color: #218dff;
    letter-spacing: -0.03rem;
    text-align: center;
    font-family: var(--font-default);
    font-weight: var(--font-weight-bold);
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
`

export const RowClaimLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;

  &::after {
    content: 'Claim';
    display: block;
    line-height: inherit;
    border: 0.1rem solid #63ab52;
    border-radius: 2rem;
    background: transparent;
    color: #63ab52;
    padding: 0.4rem 1rem;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    box-sizing: border-box;
    margin: 0 0 0 0.5rem;
  }

  &:hover::after {
    background: var(--color-button-success);
    color: white;
  }
`

export const LineSeparator = styled.div`
  border: 0.03125rem solid var(--color-text-primary);
  margin: auto;
  width: calc(100% - 1.5625rem);
`
