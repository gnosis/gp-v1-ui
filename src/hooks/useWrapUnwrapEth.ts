import { Receipt, TxOptionalParams } from 'types'
import { assert } from '@gnosis.pm/dex-js'
import { wethApi } from 'api'
import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { WrapUnwrapParams } from 'api/weth/WethApi'
import { logDebug } from 'utils'
import { DISABLE_SPINNER_DELAY } from 'const'

export interface Result {
  wrappingEth: boolean
  unwrappingWeth: boolean
  wrapEth(amount: string): Promise<Receipt>
  unwrapWeth(amount: string): Promise<Receipt>
}

export interface Params {
  txOptionalParams: TxOptionalParams
}

interface WrapUnwrapAuxParams {
  userAddress: string | undefined
  networkId: number | undefined
  isConnected: boolean | undefined
  amount: string
  txOptionalParams: TxOptionalParams
  setLoadingFlag: React.Dispatch<React.SetStateAction<boolean>>
  execute: (params: WrapUnwrapParams) => Promise<Receipt>
}

async function wrapUnwrapAux(params: WrapUnwrapAuxParams): Promise<Receipt> {
  const { networkId, isConnected, userAddress, amount, txOptionalParams, setLoadingFlag, execute } = params
  try {
    assert(networkId, 'No valid networkId found')
    assert(isConnected, "There's no connected wallet")
    assert(userAddress, 'No valid user address found')
    assert(amount, 'No valid amount')

    const receipt = await execute({
      userAddress,
      networkId,
      amount,
      txOptionalParams: {
        onSentTransaction: (txHash: string): void => {
          setLoadingFlag(true)
          if (txOptionalParams.onSentTransaction) {
            txOptionalParams.onSentTransaction(txHash)
          }
        },
      },
    })
    return receipt
  } finally {
    setTimeout(() => setLoadingFlag(false), DISABLE_SPINNER_DELAY)
  }
}

export const useWrapUnwrapEth = (params: Params): Result => {
  const { txOptionalParams } = params
  const { userAddress, isConnected, networkId } = useWalletConnection()
  const [wrappingEth, setWrappingEth] = useSafeState(false)
  const [unwrappingWeth, setUnwrappingWeth] = useSafeState(false)
  const baseParams = {
    userAddress,
    networkId,
    isConnected,
    txOptionalParams,
  }

  async function wrapEth(amount: string): Promise<Receipt> {
    logDebug('[useWrapUnwrapEth] Wrap ETH: ' + amount)
    return wrapUnwrapAux({
      ...baseParams,
      amount,
      setLoadingFlag: setWrappingEth,
      execute: params => wethApi.deposit(params),
    })
  }

  async function unwrapWeth(amount: string): Promise<Receipt> {
    logDebug('[useWrapUnwrapEth] Unwrap ETH: ' + amount)
    return wrapUnwrapAux({
      ...baseParams,
      amount,
      setLoadingFlag: setUnwrappingWeth,
      execute: params => wethApi.withdraw(params),
    })
  }

  console.log('wrappingEth, unwrappingWeth', wrappingEth, unwrappingWeth)

  return { wrappingEth, unwrappingWeth, wrapEth, unwrapWeth }
}
