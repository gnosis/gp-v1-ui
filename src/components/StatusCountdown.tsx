import React from 'react'
import { formatSeconds } from 'utils'
import { useTimeRemainingInBatch } from 'hooks/useTimeRemainingInBatch'

export const StatusCountdown: React.FC<{ timeoutDelta?: number }> = ({ timeoutDelta }) => {
  // If it's rendered, it means it should display the countdown
  const timeRemainingInBatch = useTimeRemainingInBatch()

  // `timeoutDelta` use case is for a countdown that's shorter than batch duration
  // instead of counting all the way down to (currently 5min) batch time, we count instead to
  // batchTime - timeoutDelta.
  // When this countdown is over but there's still time left in the batch, return 0 for safety.
  // Up to parent component to stop rendering at that time
  const timeRemaining = timeoutDelta ? Math.max(0, timeRemainingInBatch - timeoutDelta) : timeRemainingInBatch

  return <>{formatSeconds(timeRemaining)}</>
}
