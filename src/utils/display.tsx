import React from 'react'
import { TokenDetails, safeTokenName } from '@gnosis.pm/dex-js'
import { EtherscanLink } from 'components/EtherscanLink'

export function displayTokenSymbolOrLink(token: TokenDetails): React.ReactNode | string {
  const displayName = safeTokenName(token)
  if (displayName.startsWith('0x')) {
    return <EtherscanLink type="token" identifier={token.address} />
  }
  return displayName
}

/**
 * computeMarketProp
 * @description returns array of potentially accepted market names by:: SELLTOKEN <SEPARATOR> BUYTOKEN
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
  const sellTokenFormatted = safeTokenName(sellToken).toLowerCase()
  const buyTokenFormatted = safeTokenName(buyToken).toLowerCase()

  const marketList = acceptedSeparators.map(sep => `${sellTokenFormatted}${sep}${buyTokenFormatted}`)

  if (inverseMarket) {
    const inverseMarketList = acceptedSeparators.map(sep => `${buyTokenFormatted}${sep}${sellTokenFormatted}`)
    return marketList.concat(inverseMarketList)
  }

  return marketList
}
