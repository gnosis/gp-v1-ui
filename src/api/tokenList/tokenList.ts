import { TokenDetails, Network } from 'types'
import { DEFAULT_PRECISION } from 'const'

import tokens from './tokenList.json'

export function getTokensByNetwork(networkId: number): TokenDetails[] {
  // Return token details
  const tokenDetails: TokenDetails[] = tokens.reduce((acc, token) => {
    const address = token.addressByNetwork[networkId]
    if (address) {
      // There's an address for the current network
      const { name, symbol, decimals = DEFAULT_PRECISION } = token
      const addressMainnet = token.addressByNetwork[Network.Mainnet]

      return [...acc, { name, symbol, decimals, address, addressMainnet }]
    }

    return acc
  }, [])

  return tokenDetails
}

export default tokens
