import { toast } from 'react-toastify'
import BN from 'bn.js'
import { assert } from '@gnosis.pm/dex-js'

import { depositApi, erc20Api } from 'api'
import { TokenBalanceDetails } from 'types'
import { ALLOWANCE_MAX_VALUE } from 'const'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { formatAmount, formatAmountFull, log, getToken, safeFilledToken } from 'utils'
import { txOptionalParams } from 'utils/transaction'

import useGlobalState from 'hooks/useGlobalState'
import { TokenLocalState, setHighlightAction, setEnablingAction, setHighlightAndClaimingAction } from 'reducers-actions'

const ON_ERROR_MESSAGE = 'No logged in user found. Please check wallet connectivity status and try again.'

interface Params {
  balances: TokenBalanceDetails[]
}

interface Result extends TokenLocalState {
  enableToken: (tokenAddress: string) => Promise<void>
  depositToken: (amount: BN, tokenAddress: string) => Promise<void>
  requestWithdrawToken: (amount: BN, tokenAddress: string) => Promise<void>
  claimToken: (tokenAddress: string) => Promise<void>
}

export const useRowActions = (params: Params): Result => {
  const { balances } = params

  const [{ tokens: state }, dispatch] = useGlobalState()

  const { userAddress, networkId } = useWalletConnection()
  const contractAddress = networkId ? depositApi.getContractAddress(networkId) : null

  async function enableToken(tokenAddress: string): Promise<void> {
    try {
      assert(userAddress, 'User address missing. Aborting.')
      assert(networkId, 'NetworkId missing. Aborting.')
      assert(contractAddress, 'Contract address missing. Aborting.')

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token, aborting.')

      dispatch(setEnablingAction(tokenAddress))

      const { symbol: tokenDisplayName } = safeFilledToken(token)

      const receipt = await erc20Api.approve({
        userAddress,
        tokenAddress,
        spenderAddress: contractAddress,
        networkId,
        amount: ALLOWANCE_MAX_VALUE,
        txOptionalParams,
      })
      log(`The transaction has been mined: ${receipt.transactionHash}`)

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
      assert(networkId, ON_ERROR_MESSAGE)

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token')

      dispatch(setHighlightAction(tokenAddress))

      const { symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.deposit({ userAddress, tokenAddress, networkId, amount, txOptionalParams })
      log(`The transaction has been mined: ${receipt.transactionHash}`)

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
      assert(networkId, ON_ERROR_MESSAGE)

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token')

      dispatch(setHighlightAction(tokenAddress))

      const { symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.requestWithdraw({
        userAddress,
        tokenAddress,
        networkId,
        amount,
        txOptionalParams,
      })
      log(`The transaction has been mined: ${receipt.transactionHash}`)

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
      assert(networkId, ON_ERROR_MESSAGE)

      const token = getToken('address', tokenAddress, balances)
      assert(token, 'No token')

      const { pendingWithdraw, symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

      console.debug(`Starting the withdraw for ${formatAmountFull(pendingWithdraw.amount, decimals)} of ${symbol}`)

      dispatch(setHighlightAndClaimingAction(tokenAddress))

      const receipt = await depositApi.withdraw({ userAddress, tokenAddress, networkId, txOptionalParams })

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
