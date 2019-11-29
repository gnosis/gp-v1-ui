import { useEffect } from 'react'
import { tokenListApi, erc20Api, depositApi } from 'api'

import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'

import { formatAmount, log, assert } from 'utils'
import { ALLOWANCE_FOR_ENABLED_TOKEN } from 'const'
import { TokenBalanceDetails, TokenDetails, WalletInfo } from 'types'

interface UseTokenBalanceResult {
  balances: TokenBalanceDetails[]
  error: boolean
  setBalances: React.Dispatch<React.SetStateAction<TokenBalanceDetails[]>>
}

async function fetchBalancesForToken(
  token: TokenDetails,
  userAddress: string,
  contractAddress: string,
): Promise<TokenBalanceDetails> {
  const tokenAddress = token.address
  const [
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    withdrawBatchId,
    currentBachId,
    walletBalance,
    allowance,
  ] = await Promise.all([
    depositApi.getBalance({ userAddress, tokenAddress }),
    depositApi.getPendingDepositAmount({ userAddress, tokenAddress }),
    depositApi.getPendingWithdrawAmount({ userAddress, tokenAddress }),
    depositApi.getPendingWithdrawBatchId({ userAddress, tokenAddress }),
    depositApi.getCurrentBatchId(),
    erc20Api.balanceOf({ userAddress, tokenAddress }),
    erc20Api.allowance({ userAddress, tokenAddress, spenderAddress: contractAddress }),
  ])

  return {
    ...token,
    decimals: token.decimals,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    claimable: withdrawingBalance.isZero() ? false : withdrawBatchId < currentBachId,
    walletBalance,
    enabled: allowance.gt(ALLOWANCE_FOR_ENABLED_TOKEN),
  }
}

async function _getBalances(walletInfo: WalletInfo): Promise<TokenBalanceDetails[]> {
  const { userAddress, networkId } = walletInfo
  if (!userAddress || !networkId) {
    return []
  }

  const contractAddress = depositApi.getContractAddress(networkId)
  assert(contractAddress, 'No valid contract address found. Stopping.')

  const tokens = tokenListApi.getTokens(networkId)

  const balancePromises: Promise<TokenBalanceDetails | null>[] = tokens.map(token =>
    fetchBalancesForToken(token, userAddress, contractAddress).catch(e => {
      log('Error for', token, userAddress, contractAddress)
      log(e)
      return null
    }),
  )
  const balances = await Promise.all(balancePromises)
  return balances.filter(Boolean) as TokenBalanceDetails[]
}

export const useTokenBalances = (): UseTokenBalanceResult => {
  const walletInfo = useWalletConnection()
  const [balances, setBalances] = useSafeState<TokenBalanceDetails[]>([])
  const [error, setError] = useSafeState(false)

  useEffect(() => {
    // can return NULL (if no address or network)
    _getBalances(walletInfo)
      .then(balances => {
        log(
          '[useTokenBalances] Wallet balances',
          balances ? balances.map(b => formatAmount(b.walletBalance, b.decimals)) : null,
        )
        setBalances(balances)
        setError(false)
      })
      .catch(error => {
        console.error('Error loading balances', error)
        setError(true)
      })
  }, [setBalances, setError, walletInfo])

  return { balances, error, setBalances }
}
