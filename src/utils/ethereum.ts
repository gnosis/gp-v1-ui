import BN from 'bn.js'

export { fromWei, toWei, isBN, toBN } from 'web3-utils'

export function toBnOrNull(value: string | number): BN | null {
  if (value === undefined || value === null || value === '') {
    return null
  }

  try {
    return new BN(value)
  } catch (error) {
    return null
  }
}

const id2Network = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  42: 'Kovan',
}

export const getNetworkFromId = (networkId: number): string => id2Network[networkId] || 'Unknown Network'
