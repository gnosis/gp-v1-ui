import useSafeState from './useSafeState'
import { getSecondsRemainingInBatch } from 'utils'
import { useEffect } from 'react'

export function useTimeRemainingInBatch(): number {
  const [timeRemaining, setTimeRemaining] = useSafeState(getSecondsRemainingInBatch())

  useEffect(() => {
    const interval = setInterval(() => setTimeRemaining(getSecondsRemainingInBatch()), 1000)

    return (): void => clearInterval(interval)
  }, [setTimeRemaining])

  return timeRemaining
}
