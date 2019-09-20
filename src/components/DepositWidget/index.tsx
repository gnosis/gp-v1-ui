import React from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { useTokenBalances } from 'hooks/useTokenBalances'
import ErrorMsg from 'components/ErrorMsg'

const Wrapper = styled.section`
  font-size: 0.85rem;
  padding-bottom: 4em;

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

  tr:last-child td {
    border-bottom: none;
  }

  td {
    padding: 1em 0.5em;
    border-bottom: 1px solid #f2f2f2;
  }

  .view-in-etherscan {
    text-align: right;
    margin-bottom: 3em;
    display: block;
  }
`

const DepositWidget: React.FC = () => {
  const { balances, error } = useTokenBalances()

  if (!balances) {
    // Loading: Do not show the widget
    return <></>
  }

  return (
    <Wrapper className="widget">
      <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="view-in-etherscan">
        <small>View verified contract</small>
      </a>
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
              balances.map(tokenBalances => <Row key={tokenBalances.addressMainnet} tokenBalances={tokenBalances} />)}
          </tbody>
        </table>
      )}
    </Wrapper>
  )
}

export default DepositWidget
