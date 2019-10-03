import { Network } from 'types'

// eslint-disable-next-line
function noop(..._args: any[]): void {}

export const log = process.env.NODE_ENV === 'test' ? noop : console.log

export const getEtherscanDomainPrefix = (networkId: Network): string => {
  return !networkId || networkId === Network.Mainnet ? '' : Network[networkId].toLowerCase() + '.'
}
