import { useState, useEffect, useRef } from 'react'
import { TokenBalanceDetails, TokenDetails, WalletInfo } from 'types'
import { tokenListApi, erc20Api, depositApi } from 'api'
import { ALLOWANCE_FOR_ENABLED_TOKEN } from 'const'
import { useWalletConnection } from './useWalletConnection'
import { formatAmount, log } from 'utils'

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
    decimals: token.decimals || 18,
    exchangeBalance,
    depositingBalance,
    withdrawingBalance,
    claimable: withdrawingBalance.isZero() ? false : withdrawBatchId < currentBachId,
    walletBalance,
    enabled: allowance.gt(ALLOWANCE_FOR_ENABLED_TOKEN),
    highlighted: false,
    enabling: false,
    claiming: false,
  }
}

async function _getBalances(walletInfo: WalletInfo): Promise<TokenBalanceDetails[]> {
  const { userAddress, networkId } = walletInfo
  log('[useTokenBalances] getBalances for %s in network %s', userAddress, networkId)
  if (!userAddress || !networkId) {
    return []
  }

  const contractAddress = depositApi.getContractAddress()
  const tokens = tokenListApi.getTokens(networkId)

  const balancePromises = tokens.map(async token => fetchBalancesForToken(token, userAddress, contractAddress))
  return Promise.all(balancePromises)
}

export const useTokenBalances = (): UseTokenBalanceResult => {
  const walletInfo = useWalletConnection()
  const [balances, setBalances] = useState<TokenBalanceDetails[]>([])
  const [error, setError] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    // can return NULL (if no address or network)
    _getBalances(walletInfo)
      .then(balances => {
        log(
          '[useTokenBalances] Wallet balances',
          balances ? balances.map(b => formatAmount(b.walletBalance, b.decimals)) : null,
        )
        setBalances(balances)
      })
      .catch(error => {
        console.error('Error loading balances', error)
        setError(true)
      })

    return function cleanUp(): void {
      mounted.current = false
    }
  }, [walletInfo])

  return { balances, error, setBalances }
}
