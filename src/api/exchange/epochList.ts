import { Network } from 'types'
import networks from '@gnosis.pm/dex-contracts/networks.json'

const CONTRACTS = ['BatchExchange']

function _getAddress(contractName: string, networkId: number): string {
  const networkInfo = networks[contractName][networkId]
  return networkInfo ? networkInfo.address : ''
}

const Network2Epoch = CONTRACTS.reduce((acc, contractName) => {
  acc[contractName] = {
    [Network.Rinkeby]: _getAddress(contractName, Network.Rinkeby),
    [Network.Mainnet]: _getAddress(contractName, Network.Mainnet),
  }

  return acc
}, {})

console.log('Network2Epoch', Network2Epoch)

export const getEpochAddressForNetwork = (networkId: Network): string | null => Network2Epoch[networkId] || null

export default Network2Epoch
