/**
 * Epoch in seconds
 */
export function getEpoch(): number {
  return Math.floor(Date.now() / 1000)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function noop(_milliseconds: number = 0): Promise<void> {}

export async function waitImpl(milliseconds: number = 2500): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout((): void => {
      resolve()
    }, milliseconds)
  })
}

export const wait = process.env.NODE_ENV === 'test' ? noop : waitImpl
