import { TokenDetails } from 'types'

// eslint-disable-next-line
function noop(..._args: any[]): void {}

export const log = process.env.NODE_ENV === 'test' ? noop : console.log

export function getToken<T extends TokenDetails, K extends keyof T>(
  key: K,
  value: string | undefined = '',
  tokens: T[] | undefined | null,
): T | undefined {
  const valueUppercase = value.toUpperCase()
  return (tokens || []).find((token: T): boolean => {
    const tokenKeyValue = token[key]
    if (tokenKeyValue) {
      return typeof tokenKeyValue === 'string' && tokenKeyValue.toString().toUpperCase() === valueUppercase
    } else {
      return false
    }
  })
}
