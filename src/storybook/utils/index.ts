import { TokenDetails } from 'types'

// searches for Token by symbol or address
// accepts default in case none found
export function findFromListHoC(tokens: TokenDetails[]): typeof _findToken {
  function _findToken(symbolOrAddress: string): TokenDetails | undefined
  function _findToken(symbolOrAddress: string, defaultToken: TokenDetails): TokenDetails
  function _findToken(symbolOrAddress: string | undefined, defaultToken: TokenDetails): TokenDetails
  function _findToken(symbolOrAddress: string, defaultToken?: TokenDetails): TokenDetails | undefined {
    return tokens.find((token) => token.symbol === symbolOrAddress || token.address === symbolOrAddress) || defaultToken
  }

  return _findToken
}

export function toTokenSymbol(token: TokenDetails): string {
  return token.symbol || token.address
}
