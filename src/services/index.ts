import { tokenListApi, exchangeApi, erc20Api, web3, theGraphApi } from 'api'

import {
  getTokenFromExchangeByAddressFactory,
  getTokenFromExchangeByIdFactory,
  addTokenToExchangeFactory,
  getPriceEstimationFactory,
} from './factories'
import { logDebug } from 'utils'
import { TokenDetails } from 'types'

const apis = {
  tokenListApi,
  exchangeApi,
  erc20Api,
  web3,
  theGraphApi,
}

export const getTokenFromExchangeByAddress = getTokenFromExchangeByAddressFactory(apis)

export const getTokenFromExchangeById = getTokenFromExchangeByIdFactory(apis)

export const addTokenToExchangeContract = addTokenToExchangeFactory(apis)

export const getPriceEstimation = getPriceEstimationFactory(apis)

export interface AddTokenToListParams {
  networkId: number
  tokenAddress: string
}
export interface AddTokenToExchangeParams extends AddTokenToListParams {
  userAddress: string
}
export interface AddTokenResult {
  success: boolean
  tokenList: TokenDetails[]
  token: TokenDetails | null
  error?: string | null
}

export const addTokenToList = async ({ networkId, tokenAddress }: AddTokenToListParams): Promise<AddTokenResult> => {
  const checkSumAddress = web3.utils.toChecksumAddress(tokenAddress)
  const token = await getTokenFromExchangeByAddress({ networkId, tokenAddress: checkSumAddress })
  let error = null

  if (token) {
    logDebug('Added new Token to userlist', token)

    tokenListApi.addToken({ token, networkId })
  } else {
    error = `Token at address ${tokenAddress} not available in Exchange contract`
    logDebug('[services:addTokenToList]', error)
  }
  return {
    success: !!token,
    tokenList: tokenListApi.getTokens(networkId),
    token,
    error,
  }
}

export const addTokenToExchange = async ({
  userAddress,
  networkId,
  tokenAddress,
}: AddTokenToExchangeParams): Promise<AddTokenResult> => {
  const checkSumAddress = web3.utils.toChecksumAddress(tokenAddress)
  const token = await addTokenToExchangeContract({ userAddress, networkId, tokenAddress: checkSumAddress })
  let error = null

  if (token) {
    logDebug('Added new Token to userlist', token)

    tokenListApi.addToken({ token, networkId })
  } else {
    error = `Token at address ${tokenAddress} could not be added to Exchange contract`
    logDebug('[services:addTokenToExchange]', error)
  }
  return {
    success: !!token,
    tokenList: tokenListApi.getTokens(networkId),
    token,
    error,
  }
}
