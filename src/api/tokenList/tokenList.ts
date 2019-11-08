import { TokenDetails, Network } from 'types'
import tokens from './tokenList.json'

interface TokenDetailsByNetwork extends Omit<TokenDetails, 'address' | 'image'> {
  addressByNetwork: { [networkId: number]: string }
}

export function getTokensByNetwork(networkId: number): TokenDetails[] {
  // Return token details
  const tokenDetails: (TokenDetails | null)[] = tokens.map((token: TokenDetailsByNetwork) => {
    const address = token.addressByNetwork[networkId]
    if (address) {
      // There's an address for the current network
      const { name, symbol, decimals } = token
      const addressMainnet = token.addressByNetwork[Network.Mainnet]

      return { name, symbol, decimals, address, addressMainnet }
    } else {
      return null
    }
  })

  // Return tokens with address for the current network
  return tokenDetails.filter(token => token != null)
}

export default tokens
