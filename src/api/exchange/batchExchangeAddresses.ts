import { Network } from 'types'
import networks from '@gnosis.pm/dex-contracts/networks.json'

function _getAddress(networkId: number): string {
  const networkInfo = networks['BatchExchange'][networkId]
  return networkInfo ? networkInfo.address : ''
}

const addressesByNetwork = {
  [Network.Rinkeby]: _getAddress(Network.Rinkeby),
  [Network.Mainnet]: _getAddress(Network.Mainnet),
}

export const getAddressForNetwork = (networkId: Network): string | null => {
  return addressesByNetwork[networkId] || null
}

export default addressesByNetwork
