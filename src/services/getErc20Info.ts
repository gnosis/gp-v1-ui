import { Erc20Api } from 'types'
import { log } from 'utils'
import { DEFAULT_DECIMALS } from 'const'

/**
 * Wraps erc20 function and returns undefined in case of failure
 */
async function wrapPromise<T>(_promise: Promise<T>): Promise<T | undefined> {
  try {
    return await _promise
  } catch (e) {
    log('Failed to get ERC20 detail', e)
    return
  }
}

interface Params {
  tokenAddress: string
  erc20Api: Erc20Api
}

interface Erc20Info {
  address: string
  symbol?: string
  name?: string
  decimals: number
}

/**
 * Fetches info for an arbitrary ERC20 token from given address
 */
export async function getErc20Info({ tokenAddress, erc20Api }: Params): Promise<Erc20Info | null> {
  try {
    // TODO: find out whether there's a smart contract at given address and it complies with ERC20
  } catch (e) {
    log('Failed to fetch ERC20 details for address %s', tokenAddress, e)
    return null
  }

  const [symbol, name, decimals] = await Promise.all([
    wrapPromise(erc20Api.symbol({ tokenAddress })),
    wrapPromise(erc20Api.name({ tokenAddress })),
    wrapPromise(erc20Api.decimals({ tokenAddress })),
  ])
  return { address: tokenAddress, symbol, name, decimals: decimals || DEFAULT_DECIMALS }
}
