import { useState, useEffect } from 'react'
import { TokenBalanceDetails } from 'types'
import { tokenApi, walletApi, erc20Api, depositApi } from 'api'

interface UseTokenBalanceResult {
  balances: TokenBalanceDetails[] | undefined
  error: boolean
}

async function _getBalances(): Promise<TokenBalanceDetails[]> {
  // TODO: Remove connect once login is done
  await walletApi.connect()

  const [userAddress, networkId] = await Promise.all([walletApi.getAddress(), walletApi.getNetworkId()])
  const tokens = tokenApi.getTokens(networkId)

  const balancePromises = tokens.map(async (token, index) => {
    const tokenAddress = token.address
    const [exchangeBalance, depositingBalance, withdrawingBalance, walletBalance] = await Promise.all([
      depositApi.getBalance(userAddress, tokenAddress),
      depositApi.getPendingDepositAmount(userAddress, tokenAddress),
      depositApi.getPendingWithdrawAmount(userAddress, tokenAddress),
      erc20Api.balanceOf(userAddress, tokenAddress),
    ])

    return {
      ...token,
      exchangeBalance,
      depositingBalance,
      withdrawingBalance,
      walletBalance,
      enabled: index !== 3,
    }
  })
  return Promise.all(balancePromises)
}

export const useTokenBalances = (): UseTokenBalanceResult => {
  const [balances, setBalances] = useState<TokenBalanceDetails[] | undefined>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    _getBalances()
      .then(balances => setBalances(balances))
      .catch(error => {
        console.error('Error loading balances', error)
        setError(error)
      })
  }, [])

  return { balances, error }
}
