import React from 'react'
import { TokenDetails, safeTokenName } from '@gnosis.pm/dex-js'
import { EtherscanLink } from 'components/common/EtherscanLink'

export function displayTokenSymbolOrLink(token: TokenDetails): React.ReactNode | string {
  const displayName = safeTokenName(token)
  if (displayName.startsWith('0x')) {
    return <EtherscanLink type="token" identifier={token.address} />
  }
  return displayName
}

export function symbolOrAddress(token: TokenDetails): string {
  return token.symbol || token.address
}

/**
 * computeMarketProp
 * @description returns array of potentially accepted market names by:: BUYTOKEN <SEPARATOR> SELLTOKEN
 * @param { sellToken, buyToken, acceptedSeparators: string[] }
 */
export function computeMarketProp({
  sellToken,
  buyToken,
  acceptedSeparators = ['-', '/', ''],
  inverseMarket = false,
}: {
  sellToken: TokenDetails
  buyToken: TokenDetails
  acceptedSeparators?: string[]
  inverseMarket?: boolean
}): string[] {
  const buyTokenFormatted = safeTokenName(buyToken).toLowerCase()
  const sellTokenFormatted = safeTokenName(sellToken).toLowerCase()

  // BUYTOKEN/SELLTOKEN
  const marketList = acceptedSeparators.map((sep) => `${buyTokenFormatted}${sep}${sellTokenFormatted}`)

  if (inverseMarket) {
    // SELLTOKEN/BUYTOKEN
    const inverseMarketList = acceptedSeparators.map((sep) => `${sellTokenFormatted}${sep}${buyTokenFormatted}`)
    return marketList.concat(inverseMarketList)
  }

  return marketList
}
