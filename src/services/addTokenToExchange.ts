import { ExchangeApi, Erc20Api } from 'types'
import { getErc20Info } from './getErc20Info'
import { log, getImageUrl } from 'utils'

interface Params {
  address: string
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
}

export async function addTokenToExchange({ address, exchangeApi, erc20Api }: Params): Promise<boolean> {
  const erc20Info = getErc20Info({ address, erc20Api })

  if (!erc20Info) {
    // TODO: I'm forbidding, but should it be allowed to use tokens without decimals for example?
    log('Cannot add token (%s) to exchange with missing details', address)
    return false
  }

  try {
    await exchangeApi.addToken(address)
  } catch (e) {
    log('Failed to add token (%s) to exchange', address)
    return false
  }

  try {
    const id = exchangeApi.getTokenIdByAddress(address)

    const token = {
      ...erc20Info,
      address,
      id,
      image: getImageUrl(address),
    }

    // TODO: add new token to tokenListApi
    log('new token: ', token)
  } catch (e) {
    log('Failed to add new token (%s) to local list of tokens', address, e)
    return false
  }

  return true
}
