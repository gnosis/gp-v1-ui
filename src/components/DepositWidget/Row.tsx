import React from 'react'
import styled from 'styled-components'
import BN from 'bn.js'

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

function formatBN(number: BN): string {
  return number.toString()
}

export const Row: React.FC<RowProps> = (props: RowProps) => {
  const {
    address,
    addressMainnet,
    name,
    image,
    symbol,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    walletBalance,
    enabled,
  } = props.tokenBalances

  return (
    <WrapperRow data-address={address} data-address-mainnet={addressMainnet}>
      <td>
        <img src={image} alt={name} onError={loadFallbackTokenImage} />
      </td>
      <td>{name}</td>
      <td>{formatBN(exchangeBalance.add(depositingBalance))}</td>
      <td>{formatBN(withdrawingBalance)}</td>
      <td>{formatBN(walletBalance)}</td>
      <td>
        {enabled ? (
          <>
            <button>+ Deposit</button>
            <button className="danger">- Withdraw</button>
          </>
        ) : (
          <button className="success">✓ Enable {symbol}</button>
        )}
      </td>
    </WrapperRow>
  )
}

export default Row
