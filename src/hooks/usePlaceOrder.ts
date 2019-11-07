import BN from 'bn.js'
import { toast } from 'react-toastify'

import { TokenDetails, PlaceOrderParams as ExchangeApiPlaceOrderParams } from 'types'
import { useState } from 'react'
import { exchangeApi } from 'api'
import { log } from 'utils'
import { txOptionalParams } from 'utils/transaction'
import { useWalletConnection } from './useWalletConnection'
import { DEFAULT_ORDER_DURATION } from 'const'

interface Params {
  callback: () => void
}

interface PlaceOrderParams {
  buyAmount: BN
  buyToken: TokenDetails
  sellAmount: BN
  sellToken: TokenDetails
}

interface Result {
  placeOrder: (params: PlaceOrderParams) => Promise<void>
  isSubmitting: boolean
}

export const usePlaceOrder = ({ callback }: Params): Result => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { userAddress } = useWalletConnection()

  async function placeOrder({ buyAmount, buyToken, sellAmount, sellToken }: PlaceOrderParams): Promise<void> {
    if (!userAddress) {
      toast.error('Wallet is not connected!')
      return
    }

    setIsSubmitting(true)
    log(
      `Placing order: buy ${buyAmount.toString()} ${buyToken.symbol} sell ${sellAmount.toString()} ${sellToken.symbol}`,
    )

    try {
      const [sellTokenId, buyTokenId, batchId] = await Promise.all([
        exchangeApi.getTokenIdByAddress(sellToken.address),
        exchangeApi.getTokenIdByAddress(buyToken.address),
        exchangeApi.getCurrentBatchId(),
      ])

      const validUntil = batchId + DEFAULT_ORDER_DURATION

      const params: ExchangeApiPlaceOrderParams = {
        userAddress,
        buyTokenId,
        sellTokenId,
        validUntil,
        buyAmount,
        sellAmount,
      }
      const result = await exchangeApi.placeOrder(params, txOptionalParams)
      log(`The transaction has been mined: ${result.receipt.transactionHash}`)

      toast.success(`Placed order id=${result.data} valid for 30min`)

      callback()
    } catch (e) {
      log(`Error placing order`, e)
      toast.error(`Error placing order: ${e.message}`)
    } finally {
      //TODO: use mounted hook thingy when available
      setIsSubmitting(false)
    }
  }

  return { placeOrder, isSubmitting }
}
