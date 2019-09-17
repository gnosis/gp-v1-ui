import React from 'react'
import styled from 'styled-components'

import { TokenBalanceDetails } from 'types'
import unknownTokenImg from 'img/unknown-token.png'

const WrapperRow = styled.tr`
  img {
    width: 30px;
    height: 30px;
  }
`

function loadFallbackTokenImage(event: React.FormEvent<HTMLImageElement>): void {
  const image = event.target as HTMLImageElement
  image.src = unknownTokenImg
}

export interface RowProps {
  tokenBalances: TokenBalanceDetails
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const tokenBalances = props.tokenBalances

  return (
    <WrapperRow data-address={tokenBalances.address} data-address-mainnet={tokenBalances.addressMainnet}>
      <td>
        <img src={tokenBalances.image} alt={tokenBalances.name} onError={loadFallbackTokenImage} />
      </td>
      <td>{tokenBalances.name}</td>
      <td>{tokenBalances.exchangeWallet}</td>
      <td>{tokenBalances.pendingDeposits}</td>
      <td>{tokenBalances.pendingWithdraws}</td>
      <td>
        {!tokenBalances.enabled && <button className="success">✓ Enable {tokenBalances.symbol}</button>}
        {tokenBalances.enabled && (
          <>
            <button>+ Deposit</button>
            <button className="danger">- Withdraw</button>
          </>
        )}
      </td>
    </WrapperRow>
  )
}

export default Row
