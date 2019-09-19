export * from './time'
export * from './format'

// eslint-disable-next-line
function noop(..._args: any[]): void {}
function logImpl(message?: any, ...optionalParams: any[]): void {
  console.log(message, ...optionalParams)
}
export const log = process.env.NODE_ENV === 'test' ? noop : logImpl
