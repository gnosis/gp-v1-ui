import Web3 from 'web3'

import { MinimalTokenDetails } from 'types'
import { logDebug, silentPromise } from 'utils'
import { DEFAULT_PRECISION } from 'const'
import { Erc20Api } from 'api/erc20/Erc20Api'

interface Params {
  tokenAddress: string
  networkId: number
  erc20Api: Erc20Api
  web3: Web3
}

/**
 * Fetches info for an arbitrary ERC20 token from given address
 */
export async function getErc20Info({
  tokenAddress,
  networkId,
  erc20Api,
  web3,
}: Params): Promise<MinimalTokenDetails | null> {
  // First check whether given address is a contract
  const code = await web3.eth.getCode(tokenAddress)
  if (code === '0x') {
    logDebug('[services:helpers:getErc20Info] Address %s does not contain a contract', tokenAddress)
    return null
  }

  // Second, check whether it's ERC20 compliant
  try {
    // totalSupply is an ERC20 mandatory read only method.
    // if the call succeeds, we assume it's compliant
    await erc20Api.totalSupply({ tokenAddress, networkId })
  } catch (e) {
    logDebug('[services:helpers:getErc20Info] Address %s is not ERC20 compliant', tokenAddress, e)
    return null
  }

  const errorMsg = '[services:helpers:getErc20Info] Failed to get ERC20 detail'
  // Query for optional details. Do not fail in case any is missing.
  const [symbol, name, decimals] = await Promise.all([
    silentPromise(erc20Api.symbol({ tokenAddress, networkId }), errorMsg),
    silentPromise(erc20Api.name({ tokenAddress, networkId }), errorMsg),
    silentPromise(erc20Api.decimals({ tokenAddress, networkId }), errorMsg),
  ])
  return { address: tokenAddress, symbol, name, decimals: decimals || DEFAULT_PRECISION }
}
