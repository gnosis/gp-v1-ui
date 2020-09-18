import { tokenListApi } from 'api'
import { isAddress } from 'web3-utils'
import { parseBigNumber, getToken } from 'utils'
import { buildSearchQuery } from 'hooks/useQuery'
import { encodeTokenSymbol } from '@gnosis.pm/dex-js'

import { BATCH_START_THRESHOLD } from './validationSchema'
import { BATCH_TIME_IN_MS } from 'const'
import { TokenDetails } from 'types'

export function calculateReceiveAmount(priceValue: string, sellValue: string): string {
  let receiveAmount = ''
  if (priceValue && sellValue) {
    const sellAmount = parseBigNumber(sellValue)
    const price = parseBigNumber(priceValue)

    if (sellAmount && price) {
      const receiveBigNumber = sellAmount.dividedBy(price)
      receiveAmount = receiveBigNumber.isNaN() || !receiveBigNumber.isFinite() ? '0' : receiveBigNumber.toString(10)
    }
  }

  return receiveAmount
}

export const preprocessTokenAddressesToAdd = (addresses: (string | undefined)[], networkId: number): string[] => {
  const tokenAddresses: string[] = []
  const addedSet = new Set()

  addresses.forEach((address) => {
    if (
      address &&
      !addedSet.has(address) &&
      !tokenListApi.hasToken({ tokenAddress: address, networkId }) &&
      isAddress(address.toLowerCase())
    ) {
      tokenAddresses.push(address)
      addedSet.add(address)
    }
  })

  return tokenAddresses
}

interface ChooseTokenInput {
  tokens: TokenDetails[]
  token: TokenDetails | null
  tokenSymbolFromUrl?: string
  defaultTokenSymbol: string
}

export const chooseTokenWithFallback = ({
  tokens,
  token,
  tokenSymbolFromUrl,
  defaultTokenSymbol,
}: ChooseTokenInput): TokenDetails => {
  return (
    token ||
    (tokenSymbolFromUrl && isAddress(tokenSymbolFromUrl?.toLowerCase())
      ? getToken('address', tokenSymbolFromUrl, tokens)
      : getToken('symbol', tokenSymbolFromUrl, tokens)) ||
    (getToken('symbol', defaultTokenSymbol, tokens) as Required<TokenDetails>)
  )
}

export function buildUrl(params: {
  sell?: string
  price?: string
  from?: string | null
  expires?: string | null
  sellToken: TokenDetails
  buyToken: TokenDetails
}): string {
  const { sell, price, from, expires, sellToken, buyToken } = params

  const searchQuery = buildSearchQuery({
    sell: sell || '',
    price: price || '',
    from: from || '',
    expires: expires || '',
  })

  return `/trade/${encodeTokenSymbol(buyToken)}-${encodeTokenSymbol(sellToken)}?${searchQuery}`
}

export const calculateValidityTimes = (timeSelected?: string | null): string => {
  if (!timeSelected || Date.now() + BATCH_TIME_IN_MS * BATCH_START_THRESHOLD > +timeSelected) return ''

  return timeSelected.toString()
}
