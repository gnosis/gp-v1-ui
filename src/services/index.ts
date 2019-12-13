import { tokenListApi, exchangeApi, erc20Api } from 'api'
import { TokenDetails } from 'types'

import { addTokenToExchange as _addTokenToExchange } from './addTokenToExchange'
import * as getTokenFromExchange from './getTokenFromExchange'

export async function addTokenToExchange({ tokenAddress }: { tokenAddress: string }): Promise<boolean> {
  return _addTokenToExchange({ address: tokenAddress, exchangeApi, erc20Api })
}

export async function getTokenFromExchangeByAddress({
  tokenAddress,
  networkId,
}: {
  tokenAddress: string
  networkId: number
}): Promise<TokenDetails | null> {
  return getTokenFromExchange.getTokenFromExchangeByAddress({
    tokenAddress,
    networkId,
    tokenListApi,
    exchangeApi,
    erc20Api,
  })
}

export async function getTokenFromExchangeById({
  tokenId,
  networkId,
}: {
  tokenId: number
  networkId: number
}): Promise<TokenDetails | null> {
  return getTokenFromExchange.getTokenFromExchangeById({
    tokenId,
    networkId,
    tokenListApi,
    exchangeApi,
    erc20Api,
  })
}
