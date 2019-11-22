import { Network } from 'types'

const Network2Epoch = {
  // TODO get addresses from env or a centralized place (npm package?)
  [Network.Rinkeby]: '0x5ABefD6234e168C39b0fD3Ec3B8A40A45a09bA14',
  // TODO fill in when deployed
  [Network.Mainnet]: '',
}

export const getEpochAddressForNetwork = (networkId: Network): string | null => Network2Epoch[networkId] || null

export default Network2Epoch
