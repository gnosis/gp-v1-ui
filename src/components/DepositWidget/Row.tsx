import React from 'react'
import styled from 'styled-components'

import { erc20Api, depositApi, walletApi } from 'api'
import { TokenBalanceDetails } from 'types'
import unknownTokenImg from 'img/unknown-token.png'
import { ALLOWANCE_VALUE } from 'const'
import { formatAmount } from 'utils'

const WrapperRow = styled.tr`
  img {
    width: 30px;
    height: 30px;
  }
`

export interface RowProps {
  tokenBalances: TokenBalanceDetails
}

function _loadFallbackTokenImage(event: React.FormEvent<HTMLImageElement>): void {
  const image = event.target as HTMLImageElement
  image.src = unknownTokenImg
}

async function _enableToken(tokenBalances: TokenBalanceDetails): Promise<void> {
  try {
    // TODO: Review after implementing connect wallet.
    //   Probably some APIs should have an implicit user and it should be login aware
    walletApi.connect()

    const { address: tokenAddress, symbol } = tokenBalances
    const userAddress = await walletApi.getAddress()
    const contractAddress = depositApi.getContractAddress()
    await erc20Api.approve(tokenAddress, userAddress, contractAddress, ALLOWANCE_VALUE)

    // TODO: Use message library
    console.log(`The token ${symbol} has being enabled for trading`)
  } catch (error) {
    console.log('Error enabling the token', error)
    // TODO: Use message library
    alert('Error enabling the token')
  }
}

export const Row: React.FC<RowProps> = ({ tokenBalances }: RowProps) => {
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
  } = tokenBalances

  return (
    <WrapperRow data-address={address} data-address-mainnet={addressMainnet}>
      <td>
        <img src={image} alt={name} onError={_loadFallbackTokenImage} />
      </td>
      <td>{name}</td>
      <td>{formatAmount(exchangeBalance.add(depositingBalance))}</td>
      <td>{formatAmount(withdrawingBalance)}</td>
      <td>{formatAmount(walletBalance)}</td>
      <td>
        {enabled ? (
          <>
            <button>+ Deposit</button>
            <button className="danger">- Withdraw</button>
          </>
        ) : (
          <button className="success" onClick={(): Promise<void> => _enableToken(tokenBalances)}>
            ✓ Enable {symbol}
          </button>
        )}
      </td>
    </WrapperRow>
  )
}

export default Row
