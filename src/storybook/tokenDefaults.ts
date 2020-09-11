import { Network, TokenDetails } from 'types'

export const networkIds = Object.values(Network).filter(Number.isInteger) as Network[]

type NetworkMap = Record<keyof typeof Network, Network>

export const networkMap = Object.entries(Network).reduce<NetworkMap>((acc, [key, val]) => {
  if (!Number.isInteger(val) || typeof val !== 'number') return acc
  acc[key] = val
  return acc
}, {} as NetworkMap)

export const defaultNetworkId = Network.Mainnet

// All Default Tokens
export const tokenList: TokenDetails[] = CONFIG.initialTokenList.map(
  ({ id, name, symbol, addressByNetwork, decimals = 18 }) => ({
    id,
    name,
    symbol,
    address: addressByNetwork[defaultNetworkId] || '0x',
    decimals: decimals,
  }),
)

type DefaultTokenDetails = Required<Pick<TokenDetails, 'id' | 'name' | 'symbol' | 'address' | 'decimals'>>

// Default params to be used as initial values
// and when there's no Token found for symbol
export const defaultBaseToken: DefaultTokenDetails = {
  id: 1,
  name: 'Base Token',
  symbol: 'BASE',
  address: '0x1',
  decimals: 18,
}

export const defaultQuoteToken: DefaultTokenDetails = {
  id: 2,
  name: 'Quote Token',
  symbol: 'QUOTE',
  address: '0x2',
  decimals: 18,
}

// Token symbols to use in control selector
export const tokenSymbols = tokenList.map((token) => token.symbol || token.address)

// Token symbols to use in control selector + default base & quote
export const tokenSymbolsWithDefaults = [defaultBaseToken.symbol, defaultQuoteToken.symbol, ...tokenSymbols]

// searches for Token by symbol or address
// accepts default in case none found
export function findTokenBySymbolOrAddress(symbolOrAddress: string): TokenDetails | undefined
export function findTokenBySymbolOrAddress(symbolOrAddress: string, defaultToken: TokenDetails): TokenDetails
export function findTokenBySymbolOrAddress(
  symbolOrAddress: string,
  defaultToken?: TokenDetails,
): TokenDetails | undefined {
  return (
    tokenList.find((token) => token.symbol === symbolOrAddress || token.address === symbolOrAddress) || defaultToken
  )
}
