import React from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { tokenApi } from 'api'
import { Network, TokenBalanceDetails } from 'types'

const Wrapper = styled.section`
  font-size: 0.85rem;
  padding-bottom: 4em;

  td,
  th {
    text-align: center;
  }

  th {
    color: #000000;
    line-height: 3;
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

function _getBalances(): TokenBalanceDetails[] {
  const tokens = tokenApi.getTokens(Network.Rinkeby)
  // Mock implementation
  return tokens.map(token => ({
    ...token,
    exchangeWallet: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
    enabled: true,
  }))
}

const DepositWidget: React.FC = () => {
  const tokenBalancesList = _getBalances()
  return (
    <Wrapper className="widget">
      <a href="https://etherscan.io" className="view-in-etherscan">
        <small>View verified contract</small>
      </a>
      <table>
        <thead>
          <tr>
            <th colSpan={2}>Token</th>
            <th>Exchange wallet</th>
            <th>Pending deposits</th>
            <th>Pending withdraws</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tokenBalancesList.map(tokenBalances => (
            <Row key={tokenBalances.addressMainnet} tokenBalances={tokenBalances} />
          ))}
        </tbody>
      </table>
    </Wrapper>
  )
}

export default DepositWidget
