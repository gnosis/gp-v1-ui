import Web3 from 'web3'

import { Erc20Api, MinimalTokenDetails } from 'types'
import { log } from 'utils'
import { DEFAULT_PRECISION } from 'const'

/**
 * Wraps erc20 function and returns undefined in case of failure
 */
async function wrapPromise<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise
  } catch (e) {
    log('Failed to get ERC20 detail', e)
    return
  }
}

interface Params {
  tokenAddress: string
  erc20Api: Erc20Api
  web3: Web3
}

/**
 * Fetches info for an arbitrary ERC20 token from given address
 */
export async function getErc20Info({ tokenAddress, erc20Api, web3 }: Params): Promise<MinimalTokenDetails | null> {
  // First check whether given address is a contract
  const code = await web3.eth.getCode(tokenAddress)
  if (code === '0x') {
    log('Address %s does not contain a contract', tokenAddress)
    return null
  }

  // Second, check whether it's ERC20 compliant
  try {
    // totalSupply is an ERC20 mandatory read only method.
    // if the call succeeds, we assume it's compliant
    await erc20Api.totalSupply({ tokenAddress })
  } catch (e) {
    log('Address %s is not ERC20 compliant', tokenAddress, e)
    return null
  }

  // Query for optional details. Do not fail in case any is missing.
  const [symbol, name, decimals] = await Promise.all([
    wrapPromise(erc20Api.symbol({ tokenAddress })),
    wrapPromise(erc20Api.name({ tokenAddress })),
    wrapPromise(erc20Api.decimals({ tokenAddress })),
  ])
  return { address: tokenAddress, symbol, name, decimals: decimals || DEFAULT_PRECISION }
}
