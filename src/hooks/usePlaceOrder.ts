import { useCallback } from 'react'
import BN from 'bn.js'
import { toast } from 'toastify'

import { MAX_BATCH_ID, BATCH_TIME } from '@gnosis.pm/dex-js'

import { TokenDetails, Receipt, TxOptionalParams } from 'types'
import { exchangeApi } from 'api'
import { PlaceOrderParams as ExchangeApiPlaceOrderParams } from 'api/exchange/ExchangeApi'
import { logDebug, formatValidity } from 'utils'
import { txOptionalParams as defaultTxOptionalParams } from 'utils/transaction'
import { useWalletConnection } from './useWalletConnection'
import { BATCHES_TO_WAIT } from 'const'
import useSafeState from './useSafeState'

interface PlaceOrderParams<T> {
  buyAmount: BN
  buyToken: T
  sellAmount: BN
  sellToken: T
  validUntil?: number
  txOptionalParams?: TxOptionalParams
}

export interface MultipleOrdersOrder extends Omit<PlaceOrderParams<number>, 'txOptionalParams'> {
  validFrom?: number
}

interface PlaceMultipleOrdersParams {
  orders: MultipleOrdersOrder[]
  txOptionalParams?: TxOptionalParams
}

interface Result {
  placeOrder: (params: PlaceOrderParams<TokenDetails>) => Promise<PlaceOrderResult>
  placeMultipleOrders: (params: PlaceMultipleOrdersParams) => Promise<PlaceOrderResult>
  isSubmitting: boolean
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
}

export interface PlaceOrderResult {
  success: boolean
  receipt?: Receipt
}

export const usePlaceOrder = (): Result => {
  const [isSubmitting, setIsSubmitting] = useSafeState(false)
  const { userAddress, networkId } = useWalletConnection()

  const placeOrder = useCallback(
    async ({
      buyAmount,
      buyToken,
      sellAmount,
      sellToken,
      validUntil,
      txOptionalParams,
    }: PlaceOrderParams<TokenDetails>): Promise<PlaceOrderResult> => {
      if (!userAddress || !networkId) {
        toast.error('Wallet is not connected!')
        return { success: false }
      }

      logDebug(
        `[usePlaceOrder] Placing order: buy ${buyAmount.toString()} ${buyToken.symbol} sell ${sellAmount.toString()} ${
          sellToken.symbol
        }`,
      )

      try {
        const [sellTokenId, buyTokenId, batchId] = await Promise.all([
          exchangeApi.getTokenIdByAddress({ tokenAddress: sellToken.address, networkId }),
          exchangeApi.getTokenIdByAddress({ tokenAddress: buyToken.address, networkId }),
          exchangeApi.getCurrentBatchId(networkId),
        ])

        if (sellTokenId === buyTokenId) {
          toast.error('Cannot place order. Tokens are the same')
          return { success: false }
        }

        logDebug(
          '[usePlaceOrder] sellTokenId, buyTokenId, batchId',
          sellTokenId,
          buyTokenId,
          batchId,
          sellToken.address,
          buyToken.address,
        )

        const params: ExchangeApiPlaceOrderParams = {
          userAddress,
          buyTokenId,
          sellTokenId,
          validUntil: validUntil ? batchId + validUntil : MAX_BATCH_ID,
          buyAmount,
          sellAmount,
          networkId,
          txOptionalParams: txOptionalParams || defaultTxOptionalParams,
        }
        const receipt = await exchangeApi.placeOrder(params)
        logDebug(`[usePlaceOrder] The transaction has been mined: ${receipt.transactionHash}`)

        // TODO: show link to orders page?
        if (validUntil) {
          // Get batch time in minutes
          //  In reality, no need to ceil cause we know batch time is 300, but it was done to avoid relying on knowing
          //  the actual value of the constant
          const validityInMinutes = Math.ceil((validUntil * BATCH_TIME) / 60)
          toast.success(`Transaction mined! Succesfully placed order valid for ${formatValidity(validityInMinutes)}`)
        } else {
          toast.success(`Transaction mined! Succesfully placed standing order`)
        }

        return { success: true, receipt }
      } catch (e) {
        console.error(`[usePlaceOrder] Error placing order`, e)

        if (e.message.match(/Must have Address to get ID/)) {
          toast.error(
            `Error placing order: One of the selected tokens is not registered in the exchange. You should register them first`,
          )
        } else {
          toast.error(`Error placing order: ${e.message}`)
        }

        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [networkId, setIsSubmitting, userAddress],
  )

  const placeMultipleOrders = useCallback(
    async ({ orders, txOptionalParams }: PlaceMultipleOrdersParams): Promise<PlaceOrderResult> => {
      if (!userAddress || !networkId) {
        toast.error('Wallet is not connected!')
        return { success: false }
      }

      logDebug(`[usePlaceOrder] Placing ${orders.length} orders at once`)

      try {
        const buyTokens: number[] = []
        const sellTokens: number[] = []

        const validFroms: number[] = []
        const validUntils: number[] = []

        const buyAmounts: BN[] = []
        const sellAmounts: BN[] = []

        const currentBatchId = await exchangeApi.getCurrentBatchId(networkId)

        orders.forEach(order => {
          buyTokens.push(order.buyToken)
          sellTokens.push(order.sellToken)

          // if not set, order is valid from placement + wait period
          validFroms.push(order.validFrom ?? currentBatchId + BATCHES_TO_WAIT)
          // if not set, order is valid forever
          validUntils.push(order.validUntil || MAX_BATCH_ID)

          buyAmounts.push(order.buyAmount)
          sellAmounts.push(order.sellAmount)
        })

        const params = {
          userAddress,
          networkId,
          buyTokens,
          sellTokens,
          validFroms,
          validUntils,
          buyAmounts,
          sellAmounts,
          txOptionalParams: txOptionalParams || defaultTxOptionalParams,
        }

        const receipt = await exchangeApi.placeValidFromOrders(params)

        logDebug(`[usePlaceOrder] The transaction has been mined: ${receipt.transactionHash}`)

        // TODO: link to orders page?
        toast.success(`Transactions mined! Succesfully placed ${orders.length} orders`)

        return { success: true, receipt }
      } catch (e) {
        console.error(`[usePlaceOrder] Error placing orders`, e)
        toast.error(`Error placing orders: ${e.message}`)

        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [networkId, setIsSubmitting, userAddress],
  )

  return { placeOrder, isSubmitting, setIsSubmitting, placeMultipleOrders }
}
