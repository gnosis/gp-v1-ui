import { findFromListHoC as findTokenHox, toTokenSymbol } from 'storybook/utils'
import { DefaultTokenDetails } from './types'

// Default params to be used as initial values
// and when there's no Token found for symbol
export const GNO: DefaultTokenDetails = {
  id: 1,
  name: 'Gnosis Token',
  address: '0x1',
  symbol: 'GNO',
  decimals: 18,
}
export const DAI: DefaultTokenDetails = {
  id: 2,
  name: 'DAI Stablecoin',
  address: '0x2',
  symbol: 'DAI',
  decimals: 18,
}

export const baseTokenDefault: DefaultTokenDetails = {
  id: 3,
  name: 'Base Token',
  symbol: 'BASE',
  address: '0x3',
  decimals: 18,
}

export const quoteTokenDefault: DefaultTokenDetails = {
  id: 4,
  name: 'Quote Token',
  symbol: 'QUOTE',
  address: '0x4',
  decimals: 18,
}

export const longNamedToken: DefaultTokenDetails = {
  id: 5,
  name: 'Super super very ultra mega hyper long token name',
  symbol: 'TOKEN',
  address: '0x5',
  decimals: 18,
}

export const emojiToken: DefaultTokenDetails = {
  id: 6,
  name: 'Emoji 🍤 Token',
  symbol: '🍤🍤🍤',
  address: '0x6',
  decimals: 18,
}

export const weirdSymbolToken: DefaultTokenDetails = {
  id: 7,
  name: 'Token-!._$[]{…<>}@#¢$%&/()=?',
  symbol: '!._$[]{…<>}@#¢$%&/()=?',
  address: '0x7',
  decimals: 18,
}

export const tokens = [GNO, DAI, baseTokenDefault, quoteTokenDefault, longNamedToken, emojiToken, weirdSymbolToken]
export const tokenSymbols = tokens.map(toTokenSymbol)
export const findToken = findTokenHox(tokens)
