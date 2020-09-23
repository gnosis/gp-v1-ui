import { Receipt, TxOptionalParams } from 'types'
import { assert } from '@gnosis.pm/dex-js'
import { wethApi } from 'api'
import { useWalletConnection } from './useWalletConnection'
import useSafeState from './useSafeState'
import { WrapUnwrapParams } from 'api/weth/WethApi'
import { logDebug } from 'utils'
import { DISABLE_SPINNER_DELAY } from 'const'
import { useMemo } from 'react'

export interface Result {
  wrappingEth: boolean
  unwrappingWeth: boolean
  wrapEth(amount: string, txOptionalParams?: TxOptionalParams): Promise<Receipt>
  unwrapWeth(amount: string, txOptionalParams?: TxOptionalParams): Promise<Receipt>
}

interface WrapUnwrapHelperParams {
  userAddress?: string
  networkId?: number
  isConnected?: boolean
  amount: string
  txOptionalParams: TxOptionalParams
  setLoadingFlag: React.Dispatch<React.SetStateAction<boolean>>
  execute: (params: WrapUnwrapParams) => Promise<Receipt>
}

async function _wrapUnwrap(params: WrapUnwrapHelperParams): Promise<Receipt> {
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

export const useWrapUnwrapEth = (): Result => {
  const { userAddress, isConnected, networkId } = useWalletConnection()
  const [wrappingEth, setWrappingEth] = useSafeState(false)
  const [unwrappingWeth, setUnwrappingWeth] = useSafeState(false)
  const baseParams = useMemo(
    () => ({
      userAddress,
      networkId,
      isConnected,
    }),
    [isConnected, networkId, userAddress],
  )

  const wrapEth = useMemo(
    () => async (amount: string, txOptionalParams: TxOptionalParams): Promise<Receipt> => {
      logDebug('[useWrapUnwrapEth] Wrap ETH: ' + amount)

      return _wrapUnwrap({
        ...baseParams,
        amount,
        setLoadingFlag: setWrappingEth,
        execute: (params) => wethApi.deposit(params),
        txOptionalParams,
      })
    },
    [baseParams, setWrappingEth],
  )

  const unwrapWeth = useMemo(
    () => async (amount: string, txOptionalParams: TxOptionalParams): Promise<Receipt> => {
      logDebug('[useWrapUnwrapEth] Unwrap ETH: ' + amount)
      return _wrapUnwrap({
        ...baseParams,
        amount,
        setLoadingFlag: setUnwrappingWeth,
        execute: (params) => wethApi.withdraw(params),
        txOptionalParams,
      })
    },
    [baseParams, setUnwrappingWeth],
  )

  return { wrappingEth, unwrappingWeth, wrapEth, unwrapWeth }
}
