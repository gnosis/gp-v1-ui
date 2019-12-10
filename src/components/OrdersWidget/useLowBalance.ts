import { useMemo, useCallback } from 'react'
import useSafeState from 'hooks/useSafeState'

interface Result {
  isLowBalance: boolean
  updateLowBalanceFactory: (id: number) => (isLow: boolean, remove?: true) => void
}

export function useLowBalance(): Result {
  const [lowBalance, setLowBalance] = useSafeState<{ [orderId: number]: boolean }>({})

  const updateLowBalanceFactory = useCallback(
    (id: number) => (isLow: boolean, remove?: true): void => {
      if (remove) {
        setLowBalance(curr => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _, ...rest } = curr // delete curr[id]
          return rest
        })
      } else if (lowBalance[id] !== isLow) {
        setLowBalance(curr => ({ ...curr, [id]: isLow }))
      }
    },
    [lowBalance, setLowBalance],
  )

  const isLowBalance = useMemo(() => {
    return Object.values(lowBalance).some(Boolean)
  }, [lowBalance])

  return { isLowBalance, updateLowBalanceFactory }
}
