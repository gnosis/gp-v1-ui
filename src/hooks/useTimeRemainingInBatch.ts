import useSafeState from './useSafeState'
import { getSecondsRemainingInBatch } from 'utils'
import { useEffect, useRef } from 'react'
import { BATCH_TIME } from 'const'

export function useTimeRemainingInBatch(): number {
  const [timeRemaining, setTimeRemaining] = useSafeState(getSecondsRemainingInBatch())

  useEffect(() => {
    const interval = setInterval(() => setTimeRemaining(getSecondsRemainingInBatch()), 1000)

    return (): void => clearInterval(interval)
  }, [setTimeRemaining])

  return timeRemaining
}

interface SecondsRemainingResult {
  secondsRemaining: number
  checkTime: boolean
}

const checkIfTime = (seconds: number): SecondsRemainingResult => {
  const secondsRemaining = getSecondsRemainingInBatch()
  return {
    secondsRemaining,
    checkTime: secondsRemaining < seconds,
  }
}

export function useCheckWhenTimeRemainingInBatch(
  seconds: number,
  callback: (SResult: SecondsRemainingResult) => void,
): void {
  // allow for fluid callback change without resetting interval
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    // how often to check
    // when there are ${seconds} seconds left in the batch
    const checkSecondsFromBatchStart = BATCH_TIME - seconds
    if (checkSecondsFromBatchStart <= 0) {
      console.warn(`seconds given ${seconds} > BATCH_TIME ${BATCH_TIME}`)
      return
    }

    const currentCheck = checkIfTime(seconds)
    let id: number

    if (currentCheck.checkTime) {
      callbackRef.current(currentCheck)
    }

    // first check on timeout not interval
    // as we start at random time in the BATCH
    const nextCheckInSeconds =
      (currentCheck.checkTime
        ? //  if currently past check time -- interval + seconds remaining in BATCH
          currentCheck.secondsRemaining + checkSecondsFromBatchStart
        : // if not yet check time -- what's left to that time
          currentCheck.secondsRemaining - seconds) + 1 // plus one second
    // because condition in contract is >= 1 minutes and we check for <
    // so we don't fall on the exact second and query blockchain
    const checkAndReport = (): void => {
      const currentCheck = checkIfTime(seconds)
      callbackRef.current(currentCheck)
    }

    id = window.setTimeout(() => {
      // now can go on interval
      id = window.setInterval(checkAndReport, BATCH_TIME * 1000)

      checkAndReport()
    }, nextCheckInSeconds * 1000)

    return (): void => {
      clearInterval(id)
    }
  }, [seconds])
}
