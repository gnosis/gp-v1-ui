import { SetStateAction, Dispatch } from 'react'
import { toast } from 'react-toastify'
import BN from 'bn.js'

import { depositApi, erc20Api } from 'api'
import { Mutation, TokenBalanceDetails } from 'types'
import { ALLOWANCE_MAX_VALUE, ZERO } from 'const'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { formatAmount, formatAmountFull, log, getToken, assert, safeFilledToken, dateToBatchId } from 'utils'
import { txOptionalParams } from 'utils/transaction'

import useGlobalState from 'hooks/useGlobalState'
import { TokenLocalState, setHighlightAction, setEnablingAction, setHighlightAndClaimingAction } from 'reducers-actions'

const ON_ERROR_MESSAGE = 'No logged in user found. Please check wallet connectivity status and try again.'

interface Params {
  balances: TokenBalanceDetails[]
  setBalances: Dispatch<SetStateAction<TokenBalanceDetails[]>>
}

interface Result extends TokenLocalState {
  enableToken: (tokenAddress: string) => Promise<void>
  depositToken: (amount: BN, tokenAddress: string) => Promise<void>
  requestWithdrawToken: (amount: BN, tokenAddress: string) => Promise<void>
  claimToken: (tokenAddress: string) => Promise<void>
}

export const useRowActions = (params: Params): Result => {
  const { balances, setBalances } = params

  const [{ tokens: state }, dispatch] = useGlobalState()

  const { userAddress, networkId } = useWalletConnection()
  const contractAddress = networkId ? depositApi.getContractAddress(networkId) : null

  function _updateToken(tokenAddress: string, updateBalances: Mutation<TokenBalanceDetails>): void {
    setBalances(balances =>
      balances.map(tokenBalancesAux => {
        const { address: tokenAddressAux } = tokenBalancesAux
        return tokenAddressAux === tokenAddress ? updateBalances(tokenBalancesAux) : tokenBalancesAux
      }),
    )
  }

  async function enableToken(tokenAddress: string): Promise<void> {
    try {
      assert(userAddress, 'User address missing. Aborting.')
      assert(contractAddress, 'Contract address missing. Aborting.')

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token, aborting.')

      dispatch(setEnablingAction(tokenAddress))

      const { symbol: tokenDisplayName } = safeFilledToken(token)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          enabling: true,
        }
      })

      const receipt = await erc20Api.approve(
        { userAddress, tokenAddress, spenderAddress: contractAddress, amount: ALLOWANCE_MAX_VALUE },
        txOptionalParams,
      )
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          enabled: true,
        }
      })

      toast.success(`The token ${tokenDisplayName} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
    } finally {
      dispatch(setEnablingAction(tokenAddress))
    }
  }

  async function depositToken(amount: BN, tokenAddress: string): Promise<void> {
    try {
      assert(userAddress, ON_ERROR_MESSAGE)

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token')

      dispatch(setHighlightAction(tokenAddress))

      const { symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.deposit({ userAddress, tokenAddress, amount }, txOptionalParams)
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, ({ pendingDeposit, walletBalance, totalExchangeBalance, ...otherParams }) => {
        const { amount: pendingAmount } = pendingDeposit
        // Since this updates the interface right after the action, and will be updated once a new block is mined
        // we calculate the batchId ourselves rather than query the contract,
        // and make it so this is in the next batch
        const batchId = dateToBatchId() + 1
        return {
          ...otherParams,
          pendingDeposit: { batchId, amount: pendingAmount.add(amount) },
          totalExchangeBalance: totalExchangeBalance.add(amount),
          walletBalance: walletBalance.sub(amount),
        }
      })

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    } finally {
      dispatch(setHighlightAction(tokenAddress))
    }
  }

  async function requestWithdrawToken(amount: BN, tokenAddress: string): Promise<void> {
    try {
      assert(userAddress, ON_ERROR_MESSAGE)

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token')

      dispatch(setHighlightAction(tokenAddress))

      const { symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.requestWithdraw({ userAddress, tokenAddress, amount }, txOptionalParams)
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        const batchId = dateToBatchId() + 1

        return {
          ...otherParams,
          pendingWithdraw: { batchId, amount },
        }
      })

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    } finally {
      dispatch(setHighlightAction(tokenAddress))
    }
  }

  async function claimToken(tokenAddress: string): Promise<void> {
    try {
      assert(userAddress, ON_ERROR_MESSAGE)

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token')

      const { pendingWithdraw, symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

      console.debug(`Starting the withdraw for ${formatAmountFull(pendingWithdraw.amount, decimals)} of ${symbol}`)

      dispatch(setHighlightAndClaimingAction(tokenAddress))

      const receipt = await depositApi.withdraw({ userAddress, tokenAddress }, txOptionalParams)

      _updateToken(tokenAddress, ({ walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          pendingWithdraw: { amount: ZERO, batchId: 0 },
          walletBalance: walletBalance.add(pendingWithdraw.amount),
          claimable: false,
        }
      })

      log(`The transaction has been mined: ${receipt.transactionHash}`)
      toast.success(`Withdraw of ${formatAmount(pendingWithdraw.amount, decimals)} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    } finally {
      dispatch(setHighlightAndClaimingAction(tokenAddress))
    }
  }

  return {
    enableToken,
    depositToken,
    requestWithdrawToken,
    claimToken,
    enabling: state.enabling,
    claiming: state.claiming,
    highlighted: state.highlighted,
  }
}
