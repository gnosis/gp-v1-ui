import useSafeState from './useSafeState'
import { getTimeRemainingInBatch } from 'utils'
import { useEffect, useRef } from 'react'
import { BATCH_TIME } from 'const'

export function useTimeRemainingInBatch(): number {
  const [timeRemaining, setTimeRemaining] = useSafeState(getTimeRemainingInBatch())

  useEffect(() => {
    let interval: null | NodeJS.Timeout = null

    function updateImmediatelyAndStartInterval(): void {
      // update once
      setTimeRemaining(getTimeRemainingInBatch())
      // update every second from now on
      interval = setInterval(() => setTimeRemaining(getTimeRemainingInBatch()), 1000)
    }

    // timeout to start the timer exactly at second mark
    const intervalStart = Date.now() % 1000

    if (intervalStart === 0) {
      // to avoid possible scheduling delays, execute right now if exactly at second mark
      updateImmediatelyAndStartInterval()
    } else {
      // otherwise, schedule starting
      interval = setTimeout(updateImmediatelyAndStartInterval, intervalStart)
    }

    return (): void => {
      // `clearInterval` works for both interval AND timeouts
      if (interval) clearInterval(interval)
    }
  }, [setTimeRemaining])

  return timeRemaining
}

interface SecondsRemainingResult {
  secondsRemaining: number
  checkTime: boolean
}

const checkIfTime = (seconds: number): SecondsRemainingResult => {
  const secondsRemaining = getTimeRemainingInBatch()
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
    let id: NodeJS.Timeout

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

    id = setTimeout(() => {
      // now can go on interval
      id = setInterval(checkAndReport, BATCH_TIME * 1000)

      checkAndReport()
    }, nextCheckInSeconds * 1000)

    return (): void => {
      // clears both timeout and interval
      clearInterval(id)
    }
  }, [seconds])
}
