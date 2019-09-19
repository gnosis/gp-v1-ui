import BN from 'bn.js'
import { fromWei } from 'web3-utils'

export function formatAmount(amount?: BN): string | null {
  if (!amount) {
    return null
  }

  return fromWei(amount).toString()
}
