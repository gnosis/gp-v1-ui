import React from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'
import Widget from 'components/layout/Widget'
import { useRowActions } from './useRowActions'

const Wrapper = styled.section`
  table {
    width: 100%;
    border-collapse: collapse;
  }

  tr {
    transition: all 0.5s ease;
  }

  td,
  th {
    text-align: center;
  }

  th {
    color: #000000;
    line-height: 1.5;
    font-size: 0.8em;
    text-transform: uppercase;
    overflow-wrap: break-word;
    padding: 0.5em;
    font-weight: 800;
  }

  tr td:last-child {
    max-width: 8rem;
    text-align: center;
    > button {
      font-size: 0.75rem;
      min-width: 6rem;
    }
  }

  td {
    padding: 1em 0.5em;
  }

  tr {
    border-bottom: 1px solid #00000026;

    @media (max-width: 768px) {
      border-bottom: 2px solid #00000026;
    }
  }

  tr:last-child {
    border-bottom: none;
  }
`

const DepositWidget: React.FC = () => {
  const { balances, setBalances, error } = useTokenBalances()
  const { enableToken, deposit, requestWithdraw, claim } = useRowActions({ balances, setBalances })

  if (balances === undefined) {
    // Loading: Do not show the widget
    return null
  }

  return (
    <Wrapper>
      <Widget>
        {error ? (
          <ErrorMsg title="oops..." message="Something happened while loading the balances" />
        ) : (
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Token</th>
                <th>
                  Exchange
                  <br />
                  wallet
                </th>
                <th>
                  Pending
                  <br />
                  withdrawals
                </th>
                <th>Wallet</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {balances &&
                balances.map(tokenBalances => (
                  <Row
                    key={tokenBalances.addressMainnet}
                    tokenBalances={tokenBalances}
                    onEnableToken={(): Promise<void> => enableToken(tokenBalances.address)}
                    onSubmitDeposit={(balance): Promise<void> => deposit(balance, tokenBalances.address)}
                    onSubmitWithdraw={(balance): Promise<void> => requestWithdraw(balance, tokenBalances.address)}
                    onClaim={(): Promise<void> => claim(tokenBalances.address)}
                  />
                ))}
            </tbody>
          </table>
        )}
      </Widget>
    </Wrapper>
  )
}

export default DepositWidget
