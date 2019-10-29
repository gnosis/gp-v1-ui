import { useState, useEffect, useRef } from 'react'
import { TokenBalanceDetails, TokenDetails, WalletInfo } from 'types'
import { tokenListApi, erc20Api, depositApi } from 'api'
import { ALLOWANCE_FOR_ENABLED_TOKEN } from 'const'
import { useWalletConnection } from './useWalletConnection'
import { formatAmount } from 'utils'

interface UseTokenBalanceResult {
  balances: TokenBalanceDetails[] | undefined
  error: boolean
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
    depositApi.getBalance(userAddress, tokenAddress),
    depositApi.getPendingDepositAmount(userAddress, tokenAddress),
    depositApi.getPendingWithdrawAmount(userAddress, tokenAddress),
    depositApi.getPendingWithdrawBatchId(userAddress, tokenAddress),
    depositApi.getCurrentBatchId(),
    erc20Api.balanceOf(tokenAddress, userAddress),
    erc20Api.allowance(tokenAddress, userAddress, contractAddress),
  ])

  return {
    ...token,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    claimable: withdrawingBalance.isZero() ? false : withdrawBatchId < currentBachId,
    walletBalance,
    enabled: allowance.gt(ALLOWANCE_FOR_ENABLED_TOKEN),
  }
}

async function _getBalances(walletInfo: WalletInfo): Promise<TokenBalanceDetails[] | null> {
  const { userAddress, networkId } = walletInfo
  console.log('[useTokenBalances] getBalances for %s in network %s', userAddress, networkId)
  if (!userAddress || !networkId) {
    return null
  }

  const contractAddress = depositApi.getContractAddress()
  const tokens = tokenListApi.getTokens(networkId)

  const balancePromises = tokens.map(async token => fetchBalancesForToken(token, userAddress, contractAddress))
  return Promise.all(balancePromises)
}

export const useTokenBalances = (): UseTokenBalanceResult => {
  const walletInfo = useWalletConnection()
  const [balances, setBalances] = useState<TokenBalanceDetails[] | null>(null)
  const [error, setError] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    _getBalances(walletInfo)
      .then(balances => {
        console.log(
          '[useTokenBalances] Wallet balances',
          balances ? balances.map(b => formatAmount(b.walletBalance)) : null,
        )
        setBalances(balances)
        setError(false)
      })
      .catch(error => {
        console.error('Error loading balances', error)
        setError(true)
      })

    return function cleanUp(): void {
      mounted.current = false
    }
  }, [walletInfo])

  return { balances, error }
}
