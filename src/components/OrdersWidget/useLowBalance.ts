import { useMemo, useCallback } from 'react'
import useSafeState from 'hooks/useSafeState'

interface Result {
  isLowBalance: boolean
  updateLowBalanceFactory: (id: number) => (isLow: boolean, remove?: true) => void
}

export function useLowBalance(): Result {
  const [lowBalanceOrderIds, setLowBalanceOrderIds] = useSafeState<Set<number>>(new Set())

  const updateLowBalanceFactory = useCallback(
    (orderId: number) => (isLow: boolean, remove?: true): void => {
      if (remove || !isLow) {
        setLowBalanceOrderIds(curr => {
          if (!curr.has(orderId)) {
            return curr
          }
          const newSet = new Set(curr)
          newSet.delete(orderId)
          return newSet
        })
      } else {
        setLowBalanceOrderIds(curr => {
          if (curr.has(orderId)) {
            return curr
          }
          const newSet = new Set(curr)
          newSet.add(orderId)
          return newSet
        })
      }
    },
    [setLowBalanceOrderIds],
  )

  const isLowBalance = useMemo(() => {
    return lowBalanceOrderIds.size > 0
  }, [lowBalanceOrderIds])

  return { isLowBalance, updateLowBalanceFactory }
}
