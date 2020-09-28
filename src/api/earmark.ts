import { logDebug } from 'utils'

// 0.1 Gwei, reasonable gasPrice that would still allow flags replacement
export const MIN_GAS_PRICE = (1e8).toString(10)

export const earmarkGasPrice = (gasPrice: string, userPrint: string): string => {
  if (!userPrint) return gasPrice

  // don't replace 8000 -> 1201, only if most significant digit is untouched
  // 80000 -> 81201
  if (userPrint.length >= gasPrice.length) {
    // if flags still don't fit even in MIN_GAS_PRICE
    if (userPrint.length >= MIN_GAS_PRICE.length) return gasPrice
    gasPrice = MIN_GAS_PRICE
  }

  const markedGasPrice = gasPrice.slice(0, -userPrint.length) + userPrint

  logDebug('Gas price', gasPrice, '->', markedGasPrice)
  return markedGasPrice
}

// simple concatenation, with '0x' for empty data to have `0x<userPrint>` at the least
export const earmarkTxData = (data = '0x', userPrint: string): string => data + userPrint

const GAS_PER_DATA_CHAR = 8 // wei

// calculates gas needed to save extra earmark data to chain
// 16 wei per 2 characters
export const calcEarmarkedGas = (userPrint: string): number => GAS_PER_DATA_CHAR * userPrint.length
