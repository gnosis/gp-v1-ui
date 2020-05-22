import { WalletApi } from './wallet/WalletApi'
import { logDebug } from 'utils'

const GAS_STATIONS = {
  1: 'https://safe-relay.gnosis.pm/api/v1/gas-station/',
  4: 'https://safe-relay.staging.gnosisdev.com/api/v1/gas-station/',
}

const GAS_PRICE_LEVEL: Exclude<keyof GasStationResponse, 'lastUpdate'> = 'standard'

let cacheKey = ''
let cachedGasPrice: string

const constructKey = ({ blockNumber, chainId }: GasPriceCacheDeps): string => chainId + '@' + blockNumber

interface GasPriceCacheDeps {
  blockNumber: number | null
  chainId: number
}

interface GasStationResponse {
  lastUpdate: string
  lowest: string
  safeLow: string
  standard: string
  fast: string
  fastest: string
}

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

const fetchGasPriceFactory = (walletApi: WalletApi) => async (): Promise<string | undefined> => {
  const { blockchainState } = walletApi

  if (!blockchainState) return undefined

  const { chainId, blockHeader } = blockchainState

  // only fetch new gasPrice when chainId or blockNumber changed
  const key = constructKey({ chainId, blockNumber: blockHeader && blockHeader.number })
  if (key === cacheKey) {
    return earmarkGasPrice(cachedGasPrice, await walletApi.userPrintAsync)
  }

  const gasStationURL = GAS_STATIONS[chainId]

  if (!gasStationURL) return undefined

  try {
    const response = await fetch(gasStationURL)
    const json: GasStationResponse = await response.json()

    const gasPrice = json[GAS_PRICE_LEVEL]
    if (gasPrice) {
      cacheKey = key
      cachedGasPrice = gasPrice

      return earmarkGasPrice(gasPrice, await walletApi.userPrintAsync)
    }
  } catch (error) {
    console.error('[api:gasStation] Error fetching gasPrice from', gasStationURL, error)
  }
  return undefined
}

export default fetchGasPriceFactory
