import { useEffect } from 'react'
import { tokenListApi, erc20Api, depositApi } from 'api'

import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'

import { formatAmount, log } from 'utils'
import { ALLOWANCE_FOR_ENABLED_TOKEN } from 'const'
import { TokenBalanceDetails, TokenDetails, WalletInfo } from 'types'

interface UseTokenBalanceResult {
  balances: TokenBalanceDetails[] | undefined
  error: boolean
  setBalances: React.Dispatch<React.SetStateAction<TokenBalanceDetails[] | null>>
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
    highlighted: false,
    enabling: false,
    claiming: false,
  }
}

async function _getBalances(walletInfo: WalletInfo): Promise<TokenBalanceDetails[] | null> {
  const { userAddress, networkId } = walletInfo
  log('[useTokenBalances] getBalances for %s in network %s', userAddress, networkId)
  if (!userAddress || !networkId) {
    return null
  }

  const contractAddress = depositApi.getContractAddress(networkId)
  const tokens = tokenListApi.getTokens(networkId)

  const balancePromises: Promise<TokenBalanceDetails | null>[] = tokens.map(async token =>
    fetchBalancesForToken(token, userAddress, contractAddress).catch(e => {
      log('Error for', token, userAddress, contractAddress)
      log(e)
      return null
    }),
  )
  const balances = await Promise.all(balancePromises)
  return balances.filter(Boolean)
}

export const useTokenBalances = (): UseTokenBalanceResult => {
  const walletInfo = useWalletConnection()
  const [balances, setBalances] = useSafeState<TokenBalanceDetails[] | null>(null)
  const [error, setError] = useSafeState(false)

  useEffect(() => {
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
