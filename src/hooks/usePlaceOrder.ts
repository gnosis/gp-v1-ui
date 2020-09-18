import { useCallback } from 'react'
import BN from 'bn.js'
import { toast } from 'toastify'

import { MAX_BATCH_ID, toPlaceValidFromOrdersParams } from '@gnosis.pm/dex-js'

import { TokenDetails, Receipt, TxOptionalParams } from 'types'
import { exchangeApi } from 'api'
import { PlaceOrderParams as ExchangeApiPlaceOrderParams } from 'api/exchange/ExchangeApi'
import { logDebug, formatDistanceStrict, formatDateLocaleShortTime, batchIdToDate } from 'utils'
import { txOptionalParams as defaultTxOptionalParams } from 'utils/transaction'
import { BATCHES_TO_WAIT } from 'const'
import useSafeState from './useSafeState'
import { getNumberOfBatchesLeftUntilNow } from 'components/TradeWidget/OrderValidity'

interface ConnectionParams {
  userAddress: string
  networkId: number
}

interface PlaceOrderParams<T> extends ConnectionParams {
  buyAmount: BN
  buyToken: T
  sellAmount: BN
  sellToken: T
  validUntil?: number
  txOptionalParams?: TxOptionalParams
}

export interface MultipleOrdersOrder
  extends Omit<PlaceOrderParams<number>, 'txOptionalParams' | 'userAddress' | 'networkId'> {
  validFrom?: number
}

interface PlaceMultipleOrdersParams extends ConnectionParams {
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

interface PlaceValidFromOrders {
  networkId: number
  orders: MultipleOrdersOrder[]
  userAddress: string
  txOptionalParams: TxOptionalParams
}

async function placeValidFromOrdersTx(placeOrderParams: PlaceValidFromOrders): Promise<Receipt> {
  const { networkId, orders, userAddress, txOptionalParams } = placeOrderParams

  // Calculate validFrom/validTo for the orders
  let asapBatchIdPromise: Promise<number>
  const ordersWithDefaults = await Promise.all(
    orders.map(async (order) => {
      // Valid from, is the one specified or ASAP
      let validFrom
      if (!order.validFrom) {
        // Asap, if no validFrom is specified
        if (!asapBatchIdPromise) {
          // Calculate asapBatchId (if it's not previously calculated)
          asapBatchIdPromise = asapBatchIdPromise = exchangeApi
            .getCurrentBatchId(networkId)
            .then((currentBatchId) => currentBatchId + BATCHES_TO_WAIT)
        }

        validFrom = await asapBatchIdPromise
      } else {
        // Use the specified validFrom
        validFrom = order.validFrom
      }

      // if not set, order is valid forever
      const validUntil = order.validUntil || MAX_BATCH_ID

      return {
        ...order,
        validFrom,
        validUntil,
      }
    }),
  )

  const { buyAmounts, sellAmounts, validFroms, validUntils, sellTokens, buyTokens } = toPlaceValidFromOrdersParams(
    ordersWithDefaults,
  )

  return exchangeApi.placeValidFromOrders({
    userAddress,
    networkId,
    buyTokens,
    sellTokens,
    validFroms,
    validUntils,
    buyAmounts,
    sellAmounts,
    txOptionalParams,
  })
}

export const usePlaceOrder = (): Result => {
  const [isSubmitting, setIsSubmitting] = useSafeState(false)

  const placeOrder = useCallback(
    async ({
      buyAmount,
      buyToken,
      sellAmount,
      sellToken,
      validUntil,
      txOptionalParams,
      userAddress,
      networkId,
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
          validUntil: validUntil || MAX_BATCH_ID,
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
          toast.success(
            `Transaction mined! Successfully placed order valid in the next batch and expiring ${formatDistanceStrict(
              new Date(validUntil),
              Date.now(),
              {
                addSuffix: true,
              },
            )}`,
          )
        } else {
          toast.success(`Transaction mined! Successfully placed order valid in the next batch and never expiring`)
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
    [setIsSubmitting],
  )

  const placeMultipleOrders = useCallback(
    async ({
      orders,
      txOptionalParams,
      userAddress,
      networkId,
    }: PlaceMultipleOrdersParams): Promise<PlaceOrderResult> => {
      if (!userAddress || !networkId) {
        toast.error('Wallet is not connected!')
        return { success: false }
      }
      logDebug(`[usePlaceOrder] Placing ${orders.length} orders at once`)

      try {
        // Send transaction
        const receipt = await placeValidFromOrdersTx({
          orders,
          userAddress,
          networkId,
          txOptionalParams: txOptionalParams || defaultTxOptionalParams,
        })

        logDebug(`[usePlaceOrder] The transaction has been mined: ${receipt.transactionHash}`)
        // placeMultipleOrders is the only way to use validFrom
        // right now app doesn't support multiple orders with different validFrom times
        // Liquidity creates multiple orders but with same order times
        if (orders.length === 1) {
          const { validFrom } = orders[0]
          const { validUntil } = orders[0]

          if (validUntil && validFrom) {
            const validFromAsDate = batchIdToDate(validFrom)
            const validUntilAsDate = batchIdToDate(validUntil)

            // TODO: link to orders page?
            toast.success(
              `Transaction mined! Succesfully placed order valid ${
                validFrom
                  ? getNumberOfBatchesLeftUntilNow(validFrom) > 3
                    ? formatDateLocaleShortTime(validFromAsDate.getTime())
                    : formatDistanceStrict(new Date(validFromAsDate), Date.now(), {
                        addSuffix: true,
                      })
                  : 'in the next batch'
              } and expiring ${formatDistanceStrict(new Date(validUntilAsDate), Date.now(), {
                addSuffix: true,
              })}`,
            )
          } else if (validUntil) {
            // TODO: link to orders page?
            toast.success(
              `Transaction mined! Succesfully placed order valid in the next batch and expiring ${formatDistanceStrict(
                batchIdToDate(validUntil),
                Date.now(),
                {
                  addSuffix: true,
                },
              )}`,
            )
          } else if (validFrom) {
            const validFromAsDate = batchIdToDate(validFrom)
            // TODO: link to orders page?
            toast.success(
              `Transaction mined! Succesfully placed order valid ${
                validFrom
                  ? getNumberOfBatchesLeftUntilNow(validFrom) > 3
                    ? formatDateLocaleShortTime(validFromAsDate.getTime())
                    : formatDistanceStrict(new Date(validFromAsDate), Date.now(), {
                        addSuffix: true,
                      })
                  : 'in the next batch'
              } and never expiring`,
            )
          }
        } else {
          toast.success(
            `Transaction mined! Succesfully placed ${orders.length} orders. Please check the orders page for their respective validity times.`,
          )
        }

        return { success: true, receipt }
      } catch (e) {
        console.error(`[usePlaceOrder] Error placing orders`, e)
        toast.error(`Error placing orders: ${e.message}`)

        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [setIsSubmitting],
  )

  return { placeOrder, isSubmitting, setIsSubmitting, placeMultipleOrders }
}
