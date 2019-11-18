import { SetStateAction, Dispatch } from 'react'
import { toast } from 'react-toastify'
import BN from 'bn.js'

import { depositApi, erc20Api } from 'api'
import { Mutation, TokenBalanceDetails } from 'types'
import { HIGHLIGHT_TIME, ALLOWANCE_MAX_VALUE, ZERO } from 'const'
import { useWalletConnection } from 'hooks/useWalletConnection'
import { formatAmount, formatAmountFull, log, getToken } from 'utils'
import { txOptionalParams } from 'utils/transaction'

interface Params {
  balances: TokenBalanceDetails[]
  setBalances: Dispatch<SetStateAction<TokenBalanceDetails[]>>
}

interface Result {
  enableToken: (tokenAddress: string) => Promise<void>
  deposit: (amount: BN, tokenAddress: string) => Promise<void>
  requestWithdraw: (amount: BN, tokenAddress: string) => Promise<void>
  claim: (tokenAddress: string) => Promise<void>
}

export const useRowActions = (params: Params): Result => {
  const { balances, setBalances } = params
  const { userAddress } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress()

  function _updateToken(tokenAddress: string, updateBalances: Mutation<TokenBalanceDetails>): void {
    setBalances(balances =>
      balances.map(tokenBalancesAux => {
        const { address: tokenAddressAux } = tokenBalancesAux
        return tokenAddressAux === tokenAddress ? updateBalances(tokenBalancesAux) : tokenBalancesAux
      }),
    )
  }

  function _clearHighlight(tokenAddress: string): void {
    setTimeout(() => {
      _updateToken(tokenAddress, tokenBalancesAux => ({
        ...tokenBalancesAux,
        highlighted: false,
      }))
    }, HIGHLIGHT_TIME)
  }

  async function enableToken(tokenAddress: string): Promise<void> {
    const { symbol } = getToken('address', tokenAddress, balances)
    try {
      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          enabling: true,
        }
      })
      const result = await erc20Api.approve(
        userAddress,
        tokenAddress,
        contractAddress,
        ALLOWANCE_MAX_VALUE,
        txOptionalParams,
      )
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          enabled: true,
          highlighted: true,
        }
      })
      _clearHighlight(tokenAddress)

      toast.success(`The token ${symbol} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
    }
  }

  async function deposit(amount: BN, tokenAddress: string): Promise<void> {
    try {
      const { symbol, decimals } = getToken('address', tokenAddress, balances)
      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const result = await depositApi.deposit(userAddress, tokenAddress, amount, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      _updateToken(tokenAddress, ({ depositingBalance, walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          depositingBalance: depositingBalance.add(amount),
          walletBalance: walletBalance.sub(amount),
          highlighted: true,
        }
      })
      _clearHighlight(tokenAddress)

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    }
  }

  async function requestWithdraw(amount: BN, tokenAddress: string): Promise<void> {
    const { symbol, decimals } = getToken('address', tokenAddress, balances)
    try {
      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

      const result = await depositApi.requestWithdraw(userAddress, tokenAddress, amount, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          withdrawingBalance: amount,
          claimable: false,
          highlighted: true,
        }
      })
      _clearHighlight(tokenAddress)

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    }
  }

  async function claim(tokenAddress: string): Promise<void> {
    const { withdrawingBalance, symbol, decimals } = getToken('address', tokenAddress, balances)
    try {
      console.debug(`Starting the withdraw for ${formatAmountFull(withdrawingBalance, decimals)} of ${symbol}`)
      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          claiming: true,
        }
      })
      const result = await depositApi.withdraw(userAddress, tokenAddress, txOptionalParams)

      _updateToken(tokenAddress, ({ exchangeBalance, walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          claiming: false,
          exchangeBalance: exchangeBalance.sub(withdrawingBalance),
          withdrawingBalance: ZERO,
          claimable: false,
          walletBalance: walletBalance.add(withdrawingBalance),
          highlighted: true,
        }
      })
      _clearHighlight(tokenAddress)

      log(`The transaction has been mined: ${result.receipt.transactionHash}`)
      toast.success(`Withdraw of ${formatAmount(withdrawingBalance, decimals)} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    }
  }

  return { enableToken, deposit, requestWithdraw, claim }
}
