import { TokenDetails } from 'types'
import { defaultNetworkId } from 'storybook/data'
import { baseTokenDefault, quoteTokenDefault } from 'storybook/data'
import { findFromListHoC } from 'storybook/utils'

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

// Token symbols to use in control selector
function toTokenSymbol(token: TokenDetails): string {
  return token.symbol || token.address
}

export const tokenConfigSymbols = tokenList.map(toTokenSymbol)

// Token symbols to use in control selector + default base & quote
export const tokenConfigSymbolsWithDefaults = [baseTokenDefault.symbol, quoteTokenDefault.symbol, ...tokenConfigSymbols]

export const findTokenConfig = findFromListHoC(tokenList)
