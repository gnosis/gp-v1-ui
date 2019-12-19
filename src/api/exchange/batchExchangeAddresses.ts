import { Network } from 'types'
import networks from '@gnosis.pm/dex-contracts/networks.json'

const CONTRACTS = ['BatchExchange']

function _getAddress(contractName: string, networkId: number): string {
  const networkInfo = networks[contractName][networkId]
  return networkInfo ? networkInfo.address : ''
}

const addressesByNetwork = CONTRACTS.reduce((acc, contractName) => {
  acc[contractName] = {
    [Network.Rinkeby]: _getAddress(contractName, Network.Rinkeby),
    [Network.Mainnet]: _getAddress(contractName, Network.Mainnet),
  }

  return acc
}, {})

export const getAddressForNetwork = (networkId: Network): string | null => addressesByNetwork[networkId] || null

export default addressesByNetwork
