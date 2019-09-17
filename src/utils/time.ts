/**
 * Epoch in seconds
 */
export function getEpoch(): number {
  return Math.floor(Date.now() / 1000)
}
