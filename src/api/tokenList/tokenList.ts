import { TokenDetails, Network } from 'types'

interface TokenDetailsByNetwork extends Omit<TokenDetails, 'address' | 'image'> {
  addressByNetwork: { [networkId: number]: string }
}

// Ether, Tether, TrueUSD, USD Coin, Paxos, Gemini, Dai
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tokens: TokenDetailsByNetwork[] = require('./tokenList.json')

export function getTokensByNetwork(networkId: number): TokenDetails[] {
  // Return token details
  const tokenDetails: (TokenDetails | null)[] = tokens.map(token => {
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
