import { useMemo } from 'react'
import { toast } from 'toastify'
import BN from 'bn.js'
import { assert } from '@gnosis.pm/dex-js'

// types, consts and utils
import { TokenBalanceDetails } from 'types'
import { ALLOWANCE_MAX_VALUE } from 'const'
import { formatSmart, formatAmountFull, logDebug, getToken, safeFilledToken } from 'utils'
import { composeOptionalParams } from 'utils/transaction'

// Api
import { depositApi, erc20Api } from 'api'

// Hooks and reducers
import { useWalletConnection } from 'hooks/useWalletConnection'
import useGlobalState from 'hooks/useGlobalState'
import {
  TokenLocalState,
  setEnablingAction,
  setHighlightAndClaimingAction,
  setHighlightAndDepositing,
  setHighlightAndWithdrawing,
  setEnabledAction,
  setImmatureClaim,
} from 'reducers-actions'

const ON_ERROR_MESSAGE = 'No logged in user found. Please check wallet connectivity status and try again.'

interface Params {
  balances: TokenBalanceDetails[]
}

interface Result extends TokenLocalState {
  enableToken: (tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void>
  depositToken: (amount: BN, tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void>
  requestWithdrawToken: (amount: BN, tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void>
  claimToken: (tokenAddress: string, onTxHash?: (hash: string) => void) => Promise<void | React.ReactText>
}

export const useRowActions = (params: Params): Result => {
  const { balances } = params

  const [{ tokens: state }, dispatch] = useGlobalState()

  const { userAddress, networkId } = useWalletConnection()

  const methods = useMemo(() => {
    const contractAddress = networkId ? depositApi.getContractAddress(networkId) : null

    async function enableToken(tokenAddress: string, onTxHash?: (hash: string) => void): Promise<void> {
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
          txOptionalParams: composeOptionalParams(onTxHash),
        })
        logDebug(`[DepositWidget:useRowActions] The transaction has been mined: ${receipt.transactionHash}`)

        toast.success(`The token ${tokenDisplayName} has been enabled for trading`)

        dispatch(setEnabledAction(tokenAddress))
      } catch (error) {
        console.error('DepositWidget:useRowActions] Error enabling the token', error)
        toast.error('Error enabling the token')
      } finally {
        dispatch(setEnablingAction(tokenAddress))
      }
    }

    async function depositToken(amount: BN, tokenAddress: string, onTxHash?: (hash: string) => void): Promise<void> {
      try {
        assert(userAddress, ON_ERROR_MESSAGE)
        assert(networkId, ON_ERROR_MESSAGE)

        const token = getToken('address', tokenAddress, balances)
        assert(token, 'No token')

        dispatch(setHighlightAndDepositing(tokenAddress))

        const { symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

        logDebug(`[DepositWidget:useRowActions] Processing deposit of ${amount} ${symbol} from ${userAddress}`)
        const receipt = await depositApi.deposit({
          userAddress,
          tokenAddress,
          networkId,
          amount,
          txOptionalParams: composeOptionalParams(onTxHash),
        })
        logDebug(`[DepositWidget:useRowActions] The transaction has been mined: ${receipt.transactionHash}`)

        toast.success(`Successfully deposited ${formatSmart(amount, decimals)} ${symbol}`)
      } catch (error) {
        console.error('DepositWidget:useRowActions] Error depositing', error)
        toast.error(`Error depositing: ${error.message}`)
      } finally {
        dispatch(setHighlightAndDepositing(tokenAddress))
      }
    }

    async function requestWithdrawToken(
      amount: BN,
      tokenAddress: string,
      onTxHash?: (hash: string) => void,
    ): Promise<void> {
      try {
        assert(userAddress, ON_ERROR_MESSAGE)
        assert(networkId, ON_ERROR_MESSAGE)

        const token = getToken('address', tokenAddress, balances)
        assert(token, 'No token')

        dispatch(setHighlightAndWithdrawing(tokenAddress))

        const { symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

        logDebug(`[DepositWidget:useRowActions] Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)

        logDebug(`[DepositWidget:useRowActions] Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)
        const receipt = await depositApi.requestWithdraw({
          userAddress,
          tokenAddress,
          networkId,
          amount,
          txOptionalParams: composeOptionalParams(onTxHash),
        })
        logDebug(`[DepositWidget:useRowActions] The transaction has been mined: ${receipt.transactionHash}`)

        toast.success(`Successfully requested withdraw of ${formatSmart(amount, decimals)} ${symbol}`)
      } catch (error) {
        console.error('DepositWidget:useRowActions] Error requesting withdraw', error)
        toast.error(`Error requesting withdraw: ${error.message}`)
      } finally {
        dispatch(setHighlightAndWithdrawing(tokenAddress))
      }
    }

    async function claimToken(
      tokenAddress: string,
      onTxHash?: (hash: string) => void,
    ): Promise<void | React.ReactText> {
      try {
        assert(userAddress, ON_ERROR_MESSAGE)
        assert(networkId, ON_ERROR_MESSAGE)
        const token = getToken('address', tokenAddress, balances)
        assert(token, 'No token')

        // highlight row after asserting tokenaddress exists
        dispatch(setHighlightAndClaimingAction(tokenAddress))

        const [lastCreditedBatchId, currentBatchId] = await Promise.all([
          depositApi.getLastCreditBatchId({ userAddress, tokenAddress, networkId }),
          depositApi.getCurrentBatchId(networkId),
        ])

        // Check if user is in immature claim state
        // if so, show warning and set to global
        // else if theyre not, but state exists, remove them
        if (lastCreditedBatchId === currentBatchId) {
          const isClaimImmature = state.immatureClaim.has(tokenAddress)
          const immatureClaimWarning = `You cannot withdraw in this batch because you received ${token.symbol} in the previous batch and the protocol requires one additional batch for settling the received tokens.
          Wait for the next batch (max 5 min) and try again.`

          // user does NOT already have immature claim status on this token
          if (!isClaimImmature) {
            dispatch(setImmatureClaim(tokenAddress))
          }

          return toast.warn(immatureClaimWarning, { autoClose: false })
          // user no longer is in block state
          // but has global state blocked status
          // REMOVE them
        } else if (state.immatureClaim.has(tokenAddress)) {
          dispatch(setImmatureClaim(tokenAddress))
        }

        const { pendingWithdraw, symbol, decimals } = safeFilledToken<TokenBalanceDetails>(token)

        console.debug(
          `Starting the withdraw for ${formatAmountFull({
            amount: pendingWithdraw.amount,
            precision: decimals,
          })} of ${symbol}`,
        )

        const receipt = await depositApi.withdraw({
          userAddress,
          tokenAddress,
          networkId,
          txOptionalParams: composeOptionalParams(onTxHash),
        })

        logDebug(`[DepositWidget:useRowActions] The transaction has been mined: ${receipt.transactionHash}`)
        toast.success(`Withdraw of ${formatSmart(pendingWithdraw.amount, decimals)} ${symbol} completed`)
      } catch (error) {
        console.error('[DepositWidget:useRowActions] Error executing the withdraw request', error)
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
    }
  }, [balances, dispatch, networkId, userAddress, state.immatureClaim])

  return useMemo(
    () => ({
      ...methods,
      ...state,
    }),
    [methods, state],
  )
}
