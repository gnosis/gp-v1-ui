import { useMemo, useCallback } from 'react'
import useSafeState from 'hooks/useSafeState'

interface Result {
  isLowBalance: boolean
  updateLowBalanceFactory: (id: number) => (isLow: boolean) => void
}

export function useLowBalance(): Result {
  const [lowBalanceOrderIds, setLowBalanceOrderIds] = useSafeState<Set<number>>(new Set())

  // Receives a orderId and returns a function to update low balance state
  const updateLowBalanceFactory = useCallback(
    (orderId: number) => {
      // Whenever OrderRow calculates whether it's over/under balance for a given order,
      // it calls the functioned returned here to update the overall low balance indicator
      // Also, when unmounting the component, it calls the function with isLow === false to clear the state
      return (isLow: boolean): void => {
        // Update local state
        setLowBalanceOrderIds(curr => {
          // Do not update state when no changes are needed:
          // - isLow and it's already in the set OR
          // - !isLow and it's not in the set
          if ((isLow && curr.has(orderId)) || (!isLow && !curr.has(orderId))) {
            return curr
          }
          const newSet = new Set(curr)
          isLow ? newSet.add(orderId) : newSet.delete(orderId)
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
