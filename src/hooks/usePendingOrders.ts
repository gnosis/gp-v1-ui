import { useEffect } from 'react'

import useGlobalState from './useGlobalState'
import useSafeState from './useSafeState'
import { useWalletConnection } from './useWalletConnection'
import { PendingTxObj } from 'api/exchange/ExchangeApi'
import { toBN } from '@gnosis.pm/dex-js'

function usePendingOrders(): PendingTxObj[] {
  const { userAddress, networkId } = useWalletConnection()

  const [{ pendingOrders: pendingOrdersGlobal }] = useGlobalState()
  const [pendingOrders, setPendingOrders] = useSafeState<PendingTxObj[]>([])

  useEffect(() => {
    if (userAddress && networkId) {
      // returned values from global state are JSON BN values
      const preParsedOrders = pendingOrdersGlobal ? pendingOrdersGlobal[networkId][userAddress] : []
      if (preParsedOrders && preParsedOrders.length > 0) {
        // JSON BN objects need to be re-cast back to BN via toBN
        const properlyParsedOrders = preParsedOrders.map(
          ({ priceNumerator, priceDenominator, remainingAmount, sellTokenBalance, ...rest }) => ({
            ...rest,
            priceNumerator: toBN(priceNumerator.toString()),
            priceDenominator: toBN(priceDenominator.toString()),
            remainingAmount: toBN(remainingAmount.toString()),
            sellTokenBalance: toBN(sellTokenBalance.toString()),
          }),
        )
        setPendingOrders(properlyParsedOrders)
      }
    }
  }, [networkId, pendingOrdersGlobal, setPendingOrders, userAddress])
  return pendingOrders
}

export default usePendingOrders
