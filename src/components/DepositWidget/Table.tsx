import * as React from 'react'
import styled from 'styled-components'
import { Row } from './Row'

import { Network, TokenBalanceDetails } from 'types'
import { tokenApi } from 'api'

const TableWrapper = styled.table``

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

const Table: React.FC = () => {
  const tokenBalancesList = _getBalances()

  return (
    <TableWrapper>
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
    </TableWrapper>
  )
}

export default Table
