import { wait } from 'utils'

export interface RateLimiterApi<T> {
  call: (promise: Promise<T>) => Promise<T>
}

interface Params {
  requestsPerSecond: number
  waitTime: number
  maxTries: number
}

export class RateLimiterApiImpl<T> implements RateLimiterApi<T> {
  private readonly bucketSize: number
  private readonly waitTime: number
  private readonly maxTries: number

  private executedCount: number
  private timerId: NodeJS.Timeout | null

  public constructor({ requestsPerSecond, waitTime, maxTries }: Params) {
    this.bucketSize = requestsPerSecond
    this.waitTime = waitTime
    this.maxTries = maxTries

    // init counter/tracker
    this.executedCount = 0
    this.timerId = null
  }

  public async call(promise: Promise<T>): Promise<T> {
    if (this.timerId === null) {
      console.log(`Starting timer`)
      this.startTimer()
    }

    for (let tries = 0; tries < this.maxTries; tries++) {
      if (this.canExecute()) {
        console.log(`Not waiting. Try ${tries}`)
        this.executedCount += 1
        return await promise
      }
      // This is always at max. Why?
      console.log(`Waiting. Try ${tries}. Used: ${this.executedCount}`)
      // naive wait period waiting as long as it takes to replenish the bucket
      // next step, use an exponential back off algorithm
      await wait(this.waitTime)
    }
    throw new Error(`Could not fulfill promise after ${this.maxTries} tries. Try again later.`)
  }

  private canExecute(): boolean {
    console.log(`${this.executedCount} < ${this.bucketSize}`)
    return this.executedCount < this.bucketSize
  }

  private resetCount(): void {
    // This is always 0. Why?
    console.log(`Resetting count. Current ${this.executedCount}`)
    this.executedCount = 0
  }

  private startTimer(): void {
    this.timerId = setInterval(this.resetCount, this.waitTime)
    console.log(`Timer id ${this.timerId}`)
  }
}
