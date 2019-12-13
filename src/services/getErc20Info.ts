import { Erc20Api } from 'types'
import { log } from 'utils'

interface Params {
  address: string
  erc20Api: Erc20Api
}

interface Erc20Info {
  symbol: string
  name?: string
  decimals: number
}

/**
 * Fetches info for an arbitrary ERC20 token from given address
 */
export async function getErc20Info({ address: tokenAddress, erc20Api }: Params): Promise<Erc20Info | null> {
  try {
    const [symbol, name, decimals] = await Promise.all([
      erc20Api.symbol({ tokenAddress }),
      erc20Api.name({ tokenAddress }),
      erc20Api.decimals({ tokenAddress }),
    ])
    return { symbol, name, decimals }
  } catch (e) {
    log('Failed to fetch ERC20 details for address %s', tokenAddress, e)
    return null
  }
}
