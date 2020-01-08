import { useCallback } from 'react'
import BN from 'bn.js'
import { toast } from 'react-toastify'

import { TokenDetails } from 'types'
import { exchangeApi } from 'api'
import { PlaceOrderParams as ExchangeApiPlaceOrderParams } from 'api/exchange/ExchangeApi'
import { log } from 'utils'
import { txOptionalParams } from 'utils/transaction'
import { useWalletConnection } from './useWalletConnection'
import { DEFAULT_ORDER_DURATION } from 'const'
import useSafeState from './useSafeState'

interface PlaceOrderParams {
  buyAmount: BN
  buyToken: TokenDetails
  sellAmount: BN
  sellToken: TokenDetails
}

interface Result {
  placeOrder: (params: PlaceOrderParams) => Promise<boolean>
  isSubmitting: boolean
}

export const usePlaceOrder = (): Result => {
  const [isSubmitting, setIsSubmitting] = useSafeState(false)
  const { userAddress } = useWalletConnection()

  const placeOrder = useCallback(
    async ({ buyAmount, buyToken, sellAmount, sellToken }: PlaceOrderParams): Promise<boolean> => {
      if (!userAddress) {
        toast.error('Wallet is not connected!')
        return false
      }

      setIsSubmitting(true)
      log(
        `Placing order: buy ${buyAmount.toString()} ${buyToken.symbol} sell ${sellAmount.toString()} ${
          sellToken.symbol
        }`,
      )

      try {
        const [sellTokenId, buyTokenId, batchId] = await Promise.all([
          exchangeApi.getTokenIdByAddress({ tokenAddress: sellToken.address }),
          exchangeApi.getTokenIdByAddress({ tokenAddress: buyToken.address }),
          exchangeApi.getCurrentBatchId(),
        ])

        if (sellTokenId !== 0 || buyTokenId !== 0) {
          log('sellTokenId, buyTokenId, batchId', sellTokenId, buyTokenId, batchId, sellToken.address, buyToken.address)

          const validUntil = batchId + DEFAULT_ORDER_DURATION

          const params: ExchangeApiPlaceOrderParams = {
            userAddress,
            buyTokenId,
            sellTokenId,
            validUntil,
            buyAmount,
            sellAmount,
            txOptionalParams,
          }
          const receipt = await exchangeApi.placeOrder(params)
          log(`The transaction has been mined: ${receipt.transactionHash}`)

          // TODO: get order id in a separate call
          // toast.success(`Placed order id=${receipt.data} valid for 30min`)

          return true
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
          return false
        }
      } catch (e) {
        log(`Error placing order`, e)
        toast.error(`Error placing order: ${e.message}`)

        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [setIsSubmitting, userAddress],
  )

  return { placeOrder, isSubmitting }
}
