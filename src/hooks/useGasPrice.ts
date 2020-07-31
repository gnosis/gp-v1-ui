import { useEffect } from 'react'
import useSafeState from './useSafeState'
import { walletApi } from 'api'

export const useGasPrice = (defaultGasPrice: number | null = null): number | null => {
  const [gasPrice, setGasPrice] = useSafeState<number | null>(null)
  useEffect(() => {
    async function getGasPrice(): Promise<void> {
      const gasPrice = (await walletApi.getGasPrice()) || defaultGasPrice
      setGasPrice(gasPrice)
    }
    getGasPrice()
  }, [setGasPrice, defaultGasPrice])

  return gasPrice
}
