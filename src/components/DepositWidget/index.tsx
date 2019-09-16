import React from 'react'
import styled from 'styled-components'

import { Row } from './Row'
import { tokenApi } from 'api'
import { Network, TokenBalanceDetails } from 'types'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  .contractLink {
    align-self: flex-end;
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

// TODO: add correct source address
const contractSource = 'https://gnosis.io'

const DepositWidget: React.FC = () => {
  const tokenBalancesList = _getBalances()
  return (
    <Wrapper className="widget">
      <a href={contractSource} className="contractLink">
        View verified contract
      </a>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Token</th>
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
