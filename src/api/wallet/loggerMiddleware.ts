import { JsonRpcMiddleware } from 'json-rpc-engine'

export const createLoggerMiddleware = (): JsonRpcMiddleware => {
  let logRequestResponse = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).logMiddleware = (enableLogging: boolean): void => {
    logRequestResponse = enableLogging
  }

  // Logger middleware
  return (req, res, next): void => {
    if (!logRequestResponse) return next()
    console.log('CPROV::Logger middleware')
    console.log('CPROV::req', req)
    console.log('CPROV::res', res)

    next(done => {
      // triggered at the end of all middlewares
      console.log('CPROV::FINAL res', res)
      done()
    })
  }
}
