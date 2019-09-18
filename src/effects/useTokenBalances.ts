import { useState, useEffect } from 'react'
import { Network, TokenBalanceDetails } from 'types'
import { depositApi } from 'api'
import { tokenApi } from 'api'

interface UseTokenBalanceResult {
  balances: TokenBalanceDetails[] | undefined
  error: boolean
}

async function _getBalances(): Promise<TokenBalanceDetails[]> {
  const tokens = tokenApi.getTokens(Network.Rinkeby)
  const userAddress = '0x1111111111111111111111111111111111111111'

  const balancePromises = tokens.map(async (token, index) => {
    const tokenAddress = token.address
    const [exchangeWallet, pendingDeposits, pendingWithdraws] = await Promise.all([
      depositApi.getBalance(userAddress, tokenAddress),
      depositApi.getPendingDepositAmount(userAddress, tokenAddress),
      depositApi.getPendingWithdrawAmount(userAddress, tokenAddress),
    ])

    return {
      ...token,
      exchangeWallet,
      pendingDeposits,
      pendingWithdraws,
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
