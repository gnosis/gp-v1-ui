import { useMemo, useCallback } from 'react'
import useSafeState from 'hooks/useSafeState'

interface Result {
  isLowBalance: boolean
  updateLowBalanceFactory: (id: number) => (isLow: boolean, remove?: true) => void
}

export function useLowBalance(): Result {
  const [lowBalance, setLowBalance] = useSafeState<Set<number>>(new Set())

  const updateLowBalanceFactory = useCallback(
    (id: number) => (isLow: boolean, remove?: true): void => {
      if (remove || !isLow) {
        setLowBalance(curr => {
          if (!curr.has(id)) {
            return curr
          }
          const newSet = new Set(curr)
          newSet.delete(id)
          return newSet
        })
      } else {
        setLowBalance(curr => {
          if (curr.has(id)) {
            return curr
          }
          const newSet = new Set(curr)
          newSet.add(id)
          return newSet
        })
      }
    },
    [setLowBalance],
  )

  const isLowBalance = useMemo(() => {
    return lowBalance.size > 0
  }, [lowBalance])

  return { isLowBalance, updateLowBalanceFactory }
}
