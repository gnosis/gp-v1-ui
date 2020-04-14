import { TokenDetails } from 'types'
import { getErc20Info } from 'services/helpers'
import { Erc20Api } from 'api/erc20/Erc20Api'
import Web3 from 'web3'
import { getImageUrl, logDebug } from 'utils'

interface Params {
  erc20Api: Erc20Api
  web3: Web3
}

export interface TokenFromErc20Params {
  tokenAddress: string
  networkId: number
}

export type TokenFromErc20 = Omit<TokenDetails, 'id'> | null

export function getTokenFromErc20Factory(closureParams: Params) {
  return async (params: TokenFromErc20Params): Promise<TokenFromErc20> => {
    // Get base info from the ERC20 contract
    const erc20Info = await getErc20Info({ ...closureParams, ...params })
    if (!erc20Info) {
      logDebug(
        '[services:factories:getTokenFromExchange] Could not get details for token token (%s)',
        params.tokenAddress,
      )
      return null
    }

    const token = {
      ...erc20Info,
      image: getImageUrl(params.tokenAddress),
    }

    return token
  }
}
