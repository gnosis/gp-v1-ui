import { useEffect } from 'react'
import useSafeState from './useSafeState'
import { walletApi } from 'api'
import { GasPriceLevel } from 'api/gasStation'

interface GasPriceParams {
  gasPriceLevel?: GasPriceLevel
  defaultGasPrice?: number | null
}

export const useGasPrice = ({ defaultGasPrice = null, gasPriceLevel }: GasPriceParams = {}): number | null => {
  const [gasPrice, setGasPrice] = useSafeState<number | null>(null)
  useEffect(() => {
    async function getGasPrice(): Promise<void> {
      const gasPrice = (await walletApi.getGasPrice(gasPriceLevel)) || defaultGasPrice
      setGasPrice(gasPrice)
    }
    getGasPrice()
  }, [setGasPrice, defaultGasPrice, gasPriceLevel])

  return gasPrice
}
