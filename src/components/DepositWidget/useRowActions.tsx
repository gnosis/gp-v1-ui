import { SetStateAction, Dispatch, useReducer } from 'react'
import { toast } from 'react-toastify'
import BN from 'bn.js'

import { depositApi, erc20Api } from 'api'
import { Mutation, TokenBalanceDetails } from 'types'
import { ALLOWANCE_MAX_VALUE, ZERO } from 'const'
import { useWalletConnection } from 'hooks/useWalletConnection'

import { formatAmount, formatAmountFull, log, getToken } from 'utils'
import { txOptionalParams } from 'utils/transaction'

interface Params {
  balances: TokenBalanceDetails[]
  setBalances: Dispatch<SetStateAction<TokenBalanceDetails[]>>
}

interface Result {
  enableToken: (tokenAddress: string) => Promise<void>
  depositToken: (amount: BN, tokenAddress: string) => Promise<void>
  requestWithdrawToken: (amount: BN, tokenAddress: string) => Promise<void>
  claimToken: (tokenAddress: string) => Promise<void>
  // State
  enabling: TokenLocalState['enabling']
  highlighted: TokenLocalState['highlighted']
  claiming: TokenLocalState['claiming']
}

interface TokenLocalState {
  enabling: Map<string, string>
  highlighted: Map<string, string>
  claiming: Map<string, string>
}

const SET_ENABLING = 'enabling'
const SET_CLAIMING = 'claiming'
const SET_HIGHLIGHTED = 'highlighted'
const SET_HIGHLIGHTED_AND_CLAIMING = 'highlighted_and_claiming'

type Actions =
  | { type: typeof SET_ENABLING; payload: string }
  | { type: typeof SET_CLAIMING; payload: string }
  | { type: typeof SET_HIGHLIGHTED; payload: string }
  | { type: typeof SET_HIGHLIGHTED_AND_CLAIMING; payload: string }

const initialState: TokenLocalState = {
  enabling: new Map(),
  highlighted: new Map(),
  claiming: new Map(),
}

const initState = (): TokenLocalState => initialState

const reducer = (state: TokenLocalState, action: Actions): TokenLocalState => {
  switch (action.type) {
    case SET_ENABLING:
    case SET_CLAIMING:
    case SET_HIGHLIGHTED:
      return {
        ...state,
        [action.type]: state[action.type].has(action.payload)
          ? state[action.type].delete(action.payload) && state[action.type]
          : state[action.type].set(action.payload, action.payload),
      }
    case SET_HIGHLIGHTED_AND_CLAIMING:
      return {
        ...state,
        claiming: state.claiming.has(action.payload)
          ? state.claiming.delete(action.payload) && state.claiming
          : state.claiming.set(action.payload, action.payload),
        highlighted: state.highlighted.has(action.payload)
          ? state.highlighted.delete(action.payload) && state.highlighted
          : state.highlighted.set(action.payload, action.payload),
      }
    default:
      return state
  }
}

export const useRowActions = (params: Params): Result => {
  const { balances, setBalances } = params

  const [state, dispatch] = useReducer(reducer, initialState, initState)

  const { userAddress, networkId } = useWalletConnection()
  const contractAddress = depositApi.getContractAddress(networkId)

  function _updateToken(tokenAddress: string, updateBalances: Mutation<TokenBalanceDetails>): void {
    setBalances(balances =>
      balances.map(tokenBalancesAux => {
        const { address: tokenAddressAux } = tokenBalancesAux
        return tokenAddressAux === tokenAddress ? updateBalances(tokenBalancesAux) : tokenBalancesAux
      }),
    )
  }

  async function enableToken(tokenAddress: string): Promise<void> {
    const { symbol } = getToken('address', tokenAddress, balances)
    try {
      dispatch({
        type: SET_ENABLING,
        payload: tokenAddress,
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
      toast.success(`The token ${symbol} has been enabled for trading`)
    } catch (error) {
      console.error('Error enabling the token', error)
      toast.error('Error enabling the token')
    } finally {
      dispatch({
        type: SET_ENABLING,
        payload: tokenAddress,
      })
    }
  }

  async function depositToken(amount: BN, tokenAddress: string): Promise<void> {
    try {
      const { symbol, decimals } = getToken('address', tokenAddress, balances)

      dispatch({
        type: SET_HIGHLIGHTED,
        payload: tokenAddress,
      })

      log(`Processing deposit of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.deposit({ userAddress, tokenAddress, amount }, txOptionalParams)
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, ({ depositingBalance, walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          depositingBalance: depositingBalance.add(amount),
          walletBalance: walletBalance.sub(amount),
        }
      })

      toast.success(`Successfully deposited ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error depositing', error)
      toast.error(`Error depositing: ${error.message}`)
    } finally {
      dispatch({
        type: SET_HIGHLIGHTED,
        payload: tokenAddress,
      })
    }
  }

  async function requestWithdrawToken(amount: BN, tokenAddress: string): Promise<void> {
    const { symbol, decimals } = getToken('address', tokenAddress, balances)
    try {
      dispatch({
        type: SET_HIGHLIGHTED,
        payload: tokenAddress,
      })

      log(`Processing withdraw request of ${amount} ${symbol} from ${userAddress}`)
      const receipt = await depositApi.requestWithdraw({ userAddress, tokenAddress, amount }, txOptionalParams)
      log(`The transaction has been mined: ${receipt.transactionHash}`)

      _updateToken(tokenAddress, otherParams => {
        return {
          ...otherParams,
          withdrawingBalance: amount,
        }
      })

      toast.success(`Successfully requested withdraw of ${formatAmount(amount, decimals)} ${symbol}`)
    } catch (error) {
      console.error('Error requesting withdraw', error)
      toast.error(`Error requesting withdraw: ${error.message}`)
    } finally {
      dispatch({
        type: SET_HIGHLIGHTED,
        payload: tokenAddress,
      })
    }
  }

  async function claimToken(tokenAddress: string): Promise<void> {
    const { withdrawingBalance, symbol, decimals } = getToken('address', tokenAddress, balances)
    try {
      console.debug(`Starting the withdraw for ${formatAmountFull(withdrawingBalance, decimals)} of ${symbol}`)

      dispatch({
        type: SET_HIGHLIGHTED_AND_CLAIMING,
        payload: tokenAddress,
      })

      const receipt = await depositApi.withdraw({ userAddress, tokenAddress }, txOptionalParams)

      _updateToken(tokenAddress, ({ exchangeBalance, walletBalance, ...otherParams }) => {
        return {
          ...otherParams,
          exchangeBalance: exchangeBalance.sub(withdrawingBalance),
          withdrawingBalance: ZERO,
          walletBalance: walletBalance.add(withdrawingBalance),
          claimable: false,
        }
      })

      log(`The transaction has been mined: ${receipt.transactionHash}`)
      toast.success(`Withdraw of ${formatAmount(withdrawingBalance, decimals)} ${symbol} completed`)
    } catch (error) {
      console.error('Error executing the withdraw request', error)
      toast.error(`Error executing the withdraw request: ${error.message}`)
    } finally {
      dispatch({
        type: SET_HIGHLIGHTED_AND_CLAIMING,
        payload: tokenAddress,
      })
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
