import { tokenListApi, exchangeApi, erc20Api, web3, theGraphApi, tcrApi, walletApi } from 'api'

import {
  getTokenFromExchangeByAddressFactory,
  getTokenFromExchangeByIdFactory,
  addTokenToExchangeFactory,
  getPriceEstimationFactory,
  subscribeToTokenListFactory,
  getTokensFactory,
  getTokenFromErc20Factory,
  TokenFromExchange,
  TokenFromErc20,
  getTradesAndTradeReversionsFactory,
  addUnlistedTokensToUserTokenListByIdFactory,
} from './factories'

import { logDebug } from 'utils'
import { TokenDetails } from 'types'
import { toChecksumAddress } from 'web3-utils'

const apis = {
  tokenListApi,
  exchangeApi,
  erc20Api,
  web3,
  theGraphApi,
  tcrApi,
  walletApi,
}

export const getTokenFromErc20 = getTokenFromErc20Factory(apis)

export const getTokenFromExchangeByAddress = getTokenFromExchangeByAddressFactory({ ...apis, getTokenFromErc20 })

export const getTokenFromExchangeById = getTokenFromExchangeByIdFactory({ ...apis, getTokenFromErc20 })

export const addTokenToExchangeContract = addTokenToExchangeFactory(apis)

export const getPriceEstimation = getPriceEstimationFactory(apis)

export const subscribeToTokenList = subscribeToTokenListFactory(apis)

export const getTokens = getTokensFactory({ ...apis, getTokenFromErc20 })

export const addUnlistedTokensToUserTokenListById = addUnlistedTokensToUserTokenListByIdFactory({
  ...apis,
  getTokenFromExchangeById,
})

export const getTradesAndTradeReversions = getTradesAndTradeReversionsFactory({
  ...apis,
  getTokens,
  addUnlistedTokensToUserTokenListById,
})

export interface TokenAndNetwork {
  networkId: number
  tokenAddress: string
}
export interface AddTokenToExchangeParams extends TokenAndNetwork {
  userAddress: string
}

interface AddTokenResultSuccess {
  success: true
  tokenList: TokenDetails[]
  token: TokenDetails
  error: null
}

interface AddTokenResultFailure {
  success: false
  tokenList: TokenDetails[]
  token: null
  error: string
}
type AddTokenResult = AddTokenResultSuccess | AddTokenResultFailure

export const isTokenAddedSuccess = (result: AddTokenResult): result is AddTokenResultSuccess => result.success

export const addTokenToList = async ({ networkId, tokenAddress }: TokenAndNetwork): Promise<AddTokenResult> => {
  const checkSumAddress = toChecksumAddress(tokenAddress)
  const { token } = await getTokenFromExchangeByAddress({ networkId, tokenAddress: checkSumAddress })
  if (token) {
    logDebug('Added new Token to userlist', token)

    tokenListApi.addToken({ token, networkId })

    return {
      success: true,
      tokenList: tokenListApi.getTokens(networkId),
      token,
      error: null,
    }
  }

  const error = `Token at address ${tokenAddress} not available in Exchange contract`
  logDebug('[services:addTokenToList]', error)

  return {
    success: false,
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
  const checkSumAddress = toChecksumAddress(tokenAddress)
  const token = await addTokenToExchangeContract({ userAddress, networkId, tokenAddress: checkSumAddress })
  if (token) {
    logDebug('Added new Token to userlist', token)

    tokenListApi.addToken({ token, networkId })

    return {
      success: true,
      tokenList: tokenListApi.getTokens(networkId),
      token,
      error: null,
    }
  }
  const error = `Token at address ${tokenAddress} could not be added to Exchange contract`
  logDebug('[services:addTokenToExchange]', error)

  return {
    success: false,
    tokenList: tokenListApi.getTokens(networkId),
    token,
    error,
  }
}

type ValidResons =
  | TokenFromExchange.NOT_ERC20
  | TokenFromExchange.NOT_REGISTERED_ON_CONTRACT
  | TokenFromExchange.NOT_IN_TOKEN_LIST

export interface FetchTokenResult {
  token: TokenDetails | TokenFromErc20 | null
  reason: ValidResons | null
  tokenAddress: string
}

export const fetchTokenData = async ({
  tokenAddress: address,
  networkId,
}: TokenAndNetwork): Promise<FetchTokenResult> => {
  const params = { tokenAddress: toChecksumAddress(address), networkId }
  try {
    const [tokenInExchange, erc20Token] = await Promise.all([
      // check if registered token
      exchangeApi.hasToken(params),
      // get ERC20 data
      getTokenFromErc20(params),
    ])

    if (!tokenInExchange)
      return {
        token: erc20Token,
        reason: erc20Token ? TokenFromExchange.NOT_REGISTERED_ON_CONTRACT : TokenFromExchange.NOT_ERC20,
        tokenAddress: params.tokenAddress,
      }

    if (!erc20Token)
      return {
        token: null,
        reason: TokenFromExchange.NOT_ERC20,
        tokenAddress: params.tokenAddress,
      }

    // get registered id
    const tokenId = await exchangeApi.getTokenIdByAddress(params)

    return {
      token: {
        ...erc20Token,
        id: tokenId,
      },
      reason: TokenFromExchange.NOT_IN_TOKEN_LIST,
      tokenAddress: params.tokenAddress,
    }
  } catch (error) {
    logDebug('Error fetching token', params, error)
    return {
      token: null,
      reason: null,
      tokenAddress: params.tokenAddress,
    }
  }
}
