import { useCallback } from 'react'
import BN from 'bn.js'
import { toast } from 'react-toastify'

import { TokenDetails, Receipt } from 'types'
import { exchangeApi } from 'api'
import { PlaceOrderParams as ExchangeApiPlaceOrderParams } from 'api/exchange/ExchangeApi'
import { log } from 'utils'
import { txOptionalParams } from 'utils/transaction'
import { useWalletConnection } from './useWalletConnection'
import { DEFAULT_ORDER_DURATION, MAX_BATCH_ID } from 'const'
import useSafeState from './useSafeState'

interface PlaceOrderParams<T> {
  buyAmount: BN
  buyToken: T
  sellAmount: BN
  sellToken: T
  validUntil?: number
}

export interface PlaceMultipleOrdersParams extends PlaceOrderParams<number> {
  validFrom?: number
}

interface Result {
  placeOrder: (params: PlaceOrderParams<TokenDetails>) => Promise<PlaceOrderResult>
  placeMultipleOrders: (orders: PlaceMultipleOrdersParams[]) => Promise<PlaceOrderResult>
  isSubmitting: boolean
}

interface PlaceOrderResult {
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
    }: PlaceOrderParams<TokenDetails>): Promise<PlaceOrderResult> => {
      if (!userAddress || !networkId) {
        toast.error('Wallet is not connected!')
        return { success: false }
      }

      setIsSubmitting(true)
      log(
        `Placing order: buy ${buyAmount.toString()} ${buyToken.symbol} sell ${sellAmount.toString()} ${
          sellToken.symbol
        }`,
      )

      try {
        const [sellTokenId, buyTokenId, batchId] = await Promise.all([
          exchangeApi.getTokenIdByAddress({ tokenAddress: sellToken.address, networkId }),
          exchangeApi.getTokenIdByAddress({ tokenAddress: buyToken.address, networkId }),
          exchangeApi.getCurrentBatchId(networkId),
        ])

        if (sellTokenId !== 0 || buyTokenId !== 0) {
          log('sellTokenId, buyTokenId, batchId', sellTokenId, buyTokenId, batchId, sellToken.address, buyToken.address)

          const params: ExchangeApiPlaceOrderParams = {
            userAddress,
            buyTokenId,
            sellTokenId,
            validUntil: validUntil || batchId + DEFAULT_ORDER_DURATION,
            buyAmount,
            sellAmount,
            networkId,
            txOptionalParams,
          }
          const receipt = await exchangeApi.placeOrder(params)
          log(`The transaction has been mined: ${receipt.transactionHash}`)

          // TODO: show link to orders page?
          toast.success(`Placed order valid for 30min`)

          return { success: true, receipt }
        } else {
          // TODO: Handle better this case
          // TODO: Review in the contracts, cause it looks like fee token is 0, what is also used for unregistered tokens
          // The addresses of the tokens are unknown
          toast.error(
            `Error placing order: One of the selected tokens is not registered in the exchange. You should register them first`,
          )
          console.error('At least one of the tokens has not been registered: %o', {
            sellToken,
            sellTokenId,
            buyToken,
            buyTokenId,
          })
          return { success: false }
        }
      } catch (e) {
        log(`Error placing order`, e)
        toast.error(`Error placing order: ${e.message}`)

        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [networkId, setIsSubmitting, userAddress],
  )

  const placeMultipleOrders = useCallback(
    async (orders: PlaceMultipleOrdersParams[]): Promise<PlaceOrderResult> => {
      if (!userAddress || !networkId) {
        toast.error('Wallet is not connected!')
        return { success: false }
      }

      setIsSubmitting(true)
      log(`Placing ${orders.length} orders at once`)

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

          // if not set, order is valid from placement
          validFroms.push(order.validFrom || currentBatchId)
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
          txOptionalParams,
        }

        const receipt = await exchangeApi.placeValidFromOrders(params)

        log(`The transaction has been mined: ${receipt.transactionHash}`)

        // TODO: link to orders page?
        toast.success(`Placed ${orders.length} orders`)

        return { success: true, receipt }
      } catch (e) {
        log(`Error placing orders`, e)
        toast.error(`Error placing orders: ${e.message}`)

        return { success: false }
      } finally {
        setIsSubmitting(false)
      }
    },
    [networkId, setIsSubmitting, userAddress],
  )

  return { placeOrder, isSubmitting, placeMultipleOrders }
}
