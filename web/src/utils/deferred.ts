export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void
export type PromiseReject = (reason?: unknown) => void

export interface Deferred<T> {
  promise: Promise<T>
  resolve: PromiseResolve<T>
  reject: PromiseReject
}

export const createDeferredPromise = <T>(): Deferred<T> => {
  let resolve: PromiseResolve<T> = () => void 0
  let reject: PromiseReject = () => void 0

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject,
  }
}
