import React from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons'

import { TokenBalanceDetails } from 'types'
import unknownTokenImg from 'img/unknown-token.png'
import { formatAmount } from 'utils'
import { useEnableTokens } from 'hooks/useEnableToken'

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
  } = tokenBalances
  const { enabled, enabling, enableToken } = useEnableTokens(tokenBalances)

  async function _enableToken(): Promise<void> {
    try {
      await enableToken()
      // TODO: Use message library
      console.log(`The token ${symbol} has being enabled for trading`)
    } catch (error) {
      console.log('Error enabling the token', error)
      // TODO: Use message library
      alert('Error enabling the token')
    }
  }

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
          <button className="success" onClick={_enableToken} disabled={enabling}>
            {enabling ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                &nbsp; Enabling {symbol}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                &nbsp; Enable {symbol}
              </>
            )}
          </button>
        )}
      </td>
    </WrapperRow>
  )
}

export default Row
