import { TokenDetails } from 'types'

// eslint-disable-next-line
function noop(..._args: any[]): void {}

export const log = process.env.NODE_ENV === 'test' ? noop : console.log

export function getToken<T extends TokenDetails>(
  key: string,
  value: string | undefined = '',
  tokens: T[] | undefined | null,
): T | undefined {
  return (tokens || []).find(token => token[key] === value.toUpperCase())
}
