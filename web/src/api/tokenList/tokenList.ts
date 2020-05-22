import { TokenDetails, Network } from 'types'
import { DEFAULT_PRECISION } from 'const'

import { getImageUrl } from 'utils'
import { tokenList } from '@gnosis.pm/dex-js'

export function getTokensByNetwork(networkId: number): TokenDetails[] {
  // Return token details
  const tokenDetails: TokenDetails[] = tokenList.reduce((acc: TokenDetails[], token) => {
    const address = token.addressByNetwork[networkId]
    if (address) {
      // There's an address for the current network
      const { id, name, symbol, decimals = DEFAULT_PRECISION } = token
      const addressMainnet = token.addressByNetwork[Network.Mainnet]

      acc.push({ id, name, symbol, decimals, address, addressMainnet, image: getImageUrl(addressMainnet) })
      return acc
    }

    return acc
  }, [])

  return tokenDetails
}

export default tokenList
