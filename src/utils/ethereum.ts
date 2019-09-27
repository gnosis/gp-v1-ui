import BN from 'bn.js'

export { fromWei, toWei, isBN } from 'web3-utils'

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
