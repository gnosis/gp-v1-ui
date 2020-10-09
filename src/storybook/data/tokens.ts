import { findFromListHoC as findTokenHox, toTokenSymbol } from 'storybook/utils'
import { DefaultTokenDetails } from './types'

export const ADDRESS_GNO = '0x6810e776880C02933D47DB1b9fc05908e5386b96'
export const ADDRESS_WXDAI = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'

// Default params to be used as initial values
// and when there's no Token found for symbol
export const GNO: DefaultTokenDetails = {
  id: 1,
  label: 'GNO',
  name: 'Gnosis Token',
  address: ADDRESS_GNO,
  symbol: 'GNO',
  decimals: 18,
}
export const DAI: DefaultTokenDetails = {
  id: 2,
  label: 'DAI',
  name: 'DAI Stablecoin',
  address: '0x2',
  symbol: 'DAI',
  decimals: 18,
}

export const baseTokenDefault: DefaultTokenDetails = {
  id: 3,
  label: 'BASE',
  name: 'Base Token',
  symbol: 'BASE',
  address: '0x3',
  decimals: 18,
}

export const quoteTokenDefault: DefaultTokenDetails = {
  id: 4,
  label: 'QUOTE',
  name: 'Quote Token',
  symbol: 'QUOTE',
  address: '0x4',
  decimals: 18,
}

export const longNamedToken: DefaultTokenDetails = {
  id: 5,
  label: 'TOKEN',
  name: 'Super super very ultra mega hyper long token name',
  symbol: 'TOKEN',
  address: '0x5',
  decimals: 18,
}

export const emojiToken: DefaultTokenDetails = {
  id: 6,
  label: '🍤🍤🍤',
  name: 'Emoji 🍤 Token',
  symbol: '🍤🍤🍤',
  address: '0x6',
  decimals: 18,
}

export const weirdSymbolToken: DefaultTokenDetails = {
  id: 7,
  label: '!._$[]{…<>}@#¢$%&/()=?',
  name: 'Token-!._$[]{…<>}@#¢$%&/()=?',
  symbol: '!._$[]{…<>}@#¢$%&/()=?',
  address: '0x7',
  decimals: 18,
}

export const tokens = [GNO, DAI, baseTokenDefault, quoteTokenDefault, longNamedToken, emojiToken, weirdSymbolToken]
export const tokenSymbols = tokens.map(toTokenSymbol)
export const findToken = findTokenHox(tokens)
